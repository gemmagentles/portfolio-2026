// Shared set-up for the UX tests (tests/ux/*.test.js): serves the built site (dist/, so run `npm run build` first;
// `npm run test:ux` does) with Vite's preview server on its own port, and opens the Chrome installed on this computer
// (set CHROME_PATH if it's somewhere else) through puppeteer-core. Each test file starts its own, and stops it after.
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';

const root = fileURLToPath(new URL('../..', import.meta.url));
const CHROME = process.env.CHROME_PATH || 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe';

// Starts the preview server and Chrome. Returns { url, browser, stop }: url is the site's address (e.g.
// http://127.0.0.1:4175), and stop() closes both.
// (Not every port works: browsers and fetch refuse some on purpose, such as 4190, so it's 4175, next to Vite's own.)
export async function startSite({ port = 4175 } = {}) {
  if (!existsSync(path.join(root, 'dist', 'index.html'))) {
    throw new Error('No built site in dist/: run `npm run build` first (or use `npm run test:ux`, which does).');
  }
  // On 127.0.0.1 exactly ("localhost" can mean a different address to the server and to the test, so they miss).
  const vite = path.join(root, 'node_modules', 'vite', 'bin', 'vite.js');
  // Its output is read (and kept, to show if it fails to start): with the output thrown away it didn't start on Windows.
  const server = spawn(process.execPath, [vite, 'preview', '--host', '127.0.0.1', '--port', String(port), '--strictPort'], {
    cwd: root,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let log = '';
  server.stdout.on('data', (chunk) => { log += chunk; });
  server.stderr.on('data', (chunk) => { log += chunk; });
  const url = `http://127.0.0.1:${port}`;
  let browser;
  try {
    await waitFor(url, () => log);
    browser = await puppeteer.launch({ executablePath: CHROME });
  } catch (error) {
    server.kill(); // never leave the server running (it would keep the test run from finishing)
    throw error;
  }
  return {
    url,
    browser,
    async stop() {
      await browser.close();
      server.kill();
    },
  };
}

// A fresh page at the given size, with any JavaScript errors on it collected in page.errors. Requests to other sites
// (Google Fonts, Cloudflare Turnstile) are skipped unless outside: true, so tests are quick and don't depend on the
// internet; they check the site's own behaviour.
export async function openPage(browser, url, { width = 1440, height = 900, outside = false } = {}) {
  const page = await browser.newPage();
  page.errors = [];
  page.on('pageerror', (error) => page.errors.push(error.message));
  if (!outside) {
    const origin = new URL(url).origin;
    await page.setRequestInterception(true);
    page.on('request', (request) => (request.url().startsWith(origin) ? request.continue() : request.abort()));
  }
  await page.setViewport({ width, height });
  // Waits for the page itself, not every outside frame (the Turnstile check's frame from Cloudflare can keep the
  // browser's final "load" from coming); tests then wait for what they need with waitForSelector.
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  return page;
}

// Waits until the server answers (up to 30 seconds); if it never does, the error includes what the server said.
async function waitFor(url, serverLog) {
  for (let tries = 0; tries < 60; tries += 1) {
    try {
      if ((await fetch(url)).ok) return;
    } catch {
      // not up yet
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`The preview server didn't start at ${url}.\n${serverLog()}`);
}
