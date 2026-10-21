// Screenshots every page of a client's live site and puts them all in their case study's hero carousel.
//
//   npm run capture -- project-slug https://www.client-site.com/
//
// It opens the site in headless Chrome, finds the pages linked in the site's header and navigation menus (in the
// order they appear, home first), and for each one scrolls down the page (so lazy-loaded images and scroll
// animations load), then saves a full-length screenshot 1440 wide as WebP in public/images/work/<slug>/pages/.
// Then it rewrites the carousel screens in work/<slug>/index.html (between the "carousel screens" markers) with one
// screen per page, named after its menu link, updates the "Home · 1 of N" line, and points the iMac in the first
// 50/50 row at the home page screenshot. It also takes the home page as it looks on an iPad and on a phone for the
// rows' iPad and phone pictures, and makes a brand guidelines board from the site (scripts/brand-board.js) for the
// fourth row. Pictures and boards you've chosen or made yourself are left alone: only placeholders and earlier
// captures are replaced.
// Run it again whenever the client's site changes. npm run new runs it for you when given the site's address.
//
// Uses the Chrome installed on this computer (set CHROME_PATH if it's somewhere else).

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import puppeteer from 'puppeteer-core';
import { makeBrandBoard } from './brand-board.js';

const root = fileURLToPath(new URL('..', import.meta.url));
const CHROME = process.env.CHROME_PATH || 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe';
const WIDTH = 1440;
const MAX_PAGES = 8; // the carousel stays easy to click through
const MAX_HEIGHT = 12000; // very long pages are cut off here (the carousel and iMac show the top anyway)

// The home page on an iPad (landscape) and a phone, for the 50/50 rows' pictures (sizes in CSS pixels, saved at 2x).
const DEVICES = [
  { label: 'an iPad', file: 'tablet.webp', width: 1180, height: 820, partial: 'work-split-tablet\\.html', placeholder: 'tablet\\.svg' },
  { label: 'a phone', file: 'phone.webp', width: 390, height: 844, partial: 'work-split-phone\\.html', placeholder: 'mobile\\.svg' },
];

// Text that's safe inside a partial setting (no " < or >) and on one line.
const clean = (text) => text.replace(/["<>]/g, '').replace(/\s+/g, ' ').trim();

// The site's own pages linked from its header and menus, home first, each once.
async function findPages(page, site) {
  const origin = new URL(site).origin;
  const links = await page.evaluate((origin) => {
    const found = [];
    for (const a of document.querySelectorAll('header a[href], nav a[href]')) {
      const url = new URL(a.href, location.href);
      if (url.origin !== origin || /\.(pdf|jpe?g|png|gif|webp|svg|zip)$/i.test(url.pathname)) continue;
      // "/home" and "/index.html" (often the logo's link) are the home page under another address.
      const path = url.pathname.replace(/\/+$/, '').replace(/^\/(home|index\.(html?|php))$/i, '') || '/';
      found.push({ url: url.origin + url.pathname, path, name: a.textContent });
    }
    return found;
  }, origin);

  const pages = [{ url: `${origin}/`, name: 'Home' }];
  const seen = new Set(['/']);
  for (const link of links) {
    const name = clean(link.name);
    if (seen.has(link.path) || !name) continue; // a logo link (no text) or a page already listed
    seen.add(link.path);
    pages.push({ url: link.url, name });
  }
  return pages.slice(0, MAX_PAGES);
}

// Loads a page and scrolls through it so everything has loaded and played, then back to the top.
async function prepare(page, url) {
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
  await page.evaluate(async () => {
    for (let y = 0; y < document.documentElement.scrollHeight; y += 400) {
      window.scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 150));
    }
    window.scrollTo(0, 0);

    // Hide things pinned to the screen below the top, such as cart and chat buttons or cookie banners: in a
    // full-length screenshot they'd float over one spot of the page. A pinned header at the top stays.
    for (const element of document.querySelectorAll('body *')) {
      if (getComputedStyle(element).position === 'fixed' && element.getBoundingClientRect().top > 150) {
        element.style.setProperty('visibility', 'hidden', 'important');
      }
    }
  });
  await new Promise((resolve) => setTimeout(resolve, 1000));
}

// A page saved full length, 1440 wide.
async function screenshot(page, url, file) {
  await prepare(page, url);
  const height = Math.min(MAX_HEIGHT, await page.evaluate(() => document.documentElement.scrollHeight));
  await page.screenshot({ path: file, type: 'webp', quality: 80, clip: { x: 0, y: 0, width: WIDTH, height }, captureBeyondViewport: true });
  return height;
}

export async function capturePages(slug, site) {
  const pageFile = path.join(root, 'work', slug, 'index.html');
  if (!fs.existsSync(pageFile)) throw new Error(`work/${slug}/index.html doesn't exist. Make it first with npm run new.`);

  let html = fs.readFileSync(pageFile, 'utf8');
  const START = '<!-- carousel screens: start -->';
  const END = '<!-- carousel screens: end -->';
  if (!html.includes(START) || !html.includes(END)) {
    throw new Error(`work/${slug}/index.html has no carousel screen markers (it wasn't made from the current template).`);
  }
  const project = clean(html.match(/id="page-carousel-title">([^<]*)</)?.[1] || slug);

  const outDir = path.join(root, 'public', 'images', 'work', slug, 'pages');
  fs.rmSync(outDir, { recursive: true, force: true }); // start fresh, so removed pages don't linger
  fs.mkdirSync(outDir, { recursive: true });

  const browser = await puppeteer.launch({ executablePath: CHROME });
  const shots = [];
  const devices = [];
  let board = null;
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: WIDTH, height: 900 });
    await page.goto(site, { waitUntil: 'networkidle2', timeout: 60000 });
    const pages = await findPages(page, site);

    for (const [i, { url, name }] of pages.entries()) {
      const file = `${String(i + 1).padStart(2, '0')}-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'page'}.webp`;
      process.stdout.write(`  ${name} (${url}) ... `);
      try {
        const height = await screenshot(page, url, path.join(outDir, file));
        shots.push({ name, file, height });
        console.log('saved');
      } catch (error) {
        console.log(`skipped (${error.message.split('\n')[0]})`);
      }
    }

    // The home page as it looks on an iPad in landscape and on a phone (the top screenful, at 2x), for the 50/50
    // rows' iPad and phone pictures. Set as touch devices, so the site shows its tablet and mobile layouts.
    for (const device of DEVICES) {
      process.stdout.write(`  Home on ${device.label} ... `);
      try {
        const screen = await browser.newPage();
        await screen.setViewport({ width: device.width, height: device.height, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
        await prepare(screen, pages[0].url);
        await screen.screenshot({ path: path.join(outDir, device.file), type: 'webp', quality: 80 });
        await screen.close();
        devices.push(device);
        console.log('saved');
      } catch (error) {
        console.log(`skipped (${error.message.split('\n')[0]})`);
      }
    }

    // The brand guidelines board, read from the home page (scripts/brand-board.js).
    process.stdout.write('  Brand board ... ');
    try {
      await prepare(page, pages[0].url);
      board = await makeBrandBoard(page, slug, project);
      console.log(board ? 'made' : 'kept yours (made by hand)');
    } catch (error) {
      console.log(`skipped (${error.message.split('\n')[0]})`);
    }
  } finally {
    await browser.close();
  }
  if (!shots.length) throw new Error('No pages could be captured.');

  // One screen per page: the first in front, then alternately right and left, the rest waiting behind
  // (the same places showcase.js gives them).
  const count = shots.length;
  const screens = shots.map(({ name, file, height }, i) => {
    let pos = i;
    if (pos > count / 2) pos -= count;
    return `<include src="showcase-screen.html" pos="${pos}" href="#work-split-title" image="/images/work/${slug}/pages/${file}" width="${WIDTH}" height="${height}" alt="The ${project} ${name} page" label="${project}" name="${name}"></include>`;
  });

  const indent = html.match(new RegExp(`\\n([ \\t]*)${START}`))?.[1] ?? '';
  html = html.replace(new RegExp(`${START}[\\s\\S]*?${END}`), [START, ...screens, END].join(`\n${indent}`));
  html = html.replace(/(<include src="showcase-controls\.html" status=")[^"]*(")/, `$1${shots[0].name} · 1 of ${count}$2`);

  // The iMac in the first 50/50 row scrolls through the home page: swap in the new screenshot and its height (which
  // sets how far it scrolls) if it shows the placeholder or an earlier capture, but leave a picture you chose.
  html = html.replace(
    /(<include src="work-split-laptop\.html"[^>]*?)image="\/images\/work\/[^"]*\/(?:home-full\.svg|pages\/[^"]+)" height="\d+"/,
    `$1image="/images/work/${slug}/pages/${shots[0].file}" height="${shots[0].height}"`,
  );

  // The iPad and phone pictures, the same way: only over the placeholder or an earlier capture.
  // Its description too, if it's still the [placeholder] one.
  for (const { partial, placeholder, file, width, height, label } of devices) {
    html = html.replace(
      new RegExp(`(<include src="${partial}"[^>]*?)image="/images/work/[^"]*/(?:${placeholder}|pages/${file})" width="\\d+" height="\\d+"([^>]*?)alt="(\\[[^"]*\\])?`),
      (match, before, between, placeholderAlt) =>
        `${before}image="/images/work/${slug}/pages/${file}" width="${width * 2}" height="${height * 2}"${between}alt="${placeholderAlt ? `The ${project} home page on ${label}` : ''}`,
    );
  }

  // The brand board in place of the screenshot placeholder in the 50/50 rows (a picture you chose stays).
  if (board) {
    html = html.replace(new RegExp(`<include src="work-split-screenshot\\.html" image="/images/work/${slug}/screenshot\\.svg"[^>]*></include>`), `<include src="${board}"></include>`);
  }

  fs.writeFileSync(pageFile, html);
  return shots;
}

// Run from the command line: npm run capture -- slug https://site/
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [slug, site] = process.argv.slice(2);
  if (!slug || !/^https?:\/\//.test(site || '')) {
    console.error('Give the case study and the live site, e.g.  npm run capture -- fraser-valley https://www.fraservalleygaels.com/');
    process.exit(1);
  }
  console.log(`Capturing ${site} for work/${slug}/:`);
  capturePages(slug, site)
    .then((shots) => console.log(`\nThe carousel now shows ${shots.length} pages: ${shots.map((s) => s.name).join(', ')}.`))
    .catch((error) => {
      console.error(`\n${error.message}`);
      process.exit(1);
    });
}
