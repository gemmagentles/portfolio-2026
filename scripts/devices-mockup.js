// Makes the "all devices" mockup for a case study's last 50/50 row: an iMac, a MacBook, an iPad and an iPhone,
// overlapping like LNDMRK's hand-made one (public/images/work/lndmrk/devices.webp), each showing the client's site.
// Used by scripts/capture-pages.js (npm run capture) after it has taken the screenshots.
//
// The devices are drawn in HTML and CSS (dark bezels, silver stand and base, soft shadows) and filled with the
// screenshots in public/images/work/<slug>/pages/:
// - the iMac shows the top of the home page (01-...webp), the MacBook the top of the next page (02-...webp, or the
//   home page again if there's only one)
// - the iPad shows tablet-portrait.webp (the home page on an upright iPad), or tablet.webp if that's missing
// - the iPhone shows phone.webp
// The page is rendered in headless Chrome with a see-through background and saved as pages/devices.webp,
// 1600 x 1246 like LNDMRK's (WebP keeps the transparency, so it sits on any panel colour).
//
// To redo just the mockup from the screenshots already there:  node scripts/devices-mockup.js project-slug

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import puppeteer from 'puppeteer-core';

const root = fileURLToPath(new URL('..', import.meta.url));
const CHROME = process.env.CHROME_PATH || 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe';
export const WIDTH = 1600;
export const HEIGHT = 1246;
export const FILE = 'devices.webp';

// The mockup page. Positions are in pixels on the 1600 x 1246 picture, measured from LNDMRK's mockup so the two
// match. Each screen's picture fills it from the top (object-fit: cover), so long pages show their first screenful.
const template = ({ desktop, laptop, tablet, phone }) => `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<style>
  * { box-sizing: border-box; margin: 0; }
  html, body { width: ${WIDTH}px; height: ${HEIGHT}px; background: transparent; overflow: hidden; }

  .device { position: absolute; }
  .screen { position: relative; overflow: hidden; background: #fff; }
  .screen img { display: block; width: 100%; height: 100%; object-fit: cover; object-position: top center; }
  /* A faint sheen across the glass, so the screens don't look flat. */
  .screen::after {
    content: ''; position: absolute; inset: 0; pointer-events: none;
    background: linear-gradient(115deg, rgb(255 255 255 / 0.1) 0%, rgb(255 255 255 / 0) 38%);
  }
  .silver { background: linear-gradient(180deg, #f1f1f3 0%, #dcdce0 55%, #c4c4ca 100%); }

  /* iMac: black glass front, silver chin, stand and foot. */
  .imac { left: 355px; top: 52px; width: 995px; }
  .imac__front {
    padding: 20px 20px 0; border-radius: 22px 22px 0 0; background: #141414;
    box-shadow: inset 0 0 0 2px #2a2a2a;
  }
  .imac__front .screen { height: 530px; border-radius: 4px 4px 0 0; }
  .imac__chin { height: 58px; border-radius: 0 0 22px 22px; box-shadow: 0 30px 60px rgb(0 0 0 / 0.14); }
  .imac__neck {
    width: 116px; height: 96px; margin-inline: auto;
    background: linear-gradient(90deg, #c9c9ce 0%, #ececef 30%, #f4f4f6 55%, #d2d2d6 100%);
    box-shadow: inset 0 14px 14px -10px rgb(0 0 0 / 0.18);
  }
  .imac__foot {
    width: 232px; height: 10px; margin-inline: auto; border-radius: 3px 3px 6px 6px;
    box-shadow: 0 10px 22px rgb(0 0 0 / 0.16);
  }

  /* MacBook: black lid in front of the iMac, then the silver base with its thumb notch. */
  .macbook { left: 105px; top: 541px; width: 786px; }
  .macbook__lid {
    width: 679px; margin-inline: auto; padding: 17px 18px 19px;
    border-radius: 20px 20px 0 0; background: #141414; box-shadow: inset 0 0 0 2px #2c2c2c;
  }
  .macbook__lid .screen { height: 395px; border-radius: 3px; }
  .macbook__base {
    position: relative; height: 24px; border-radius: 3px 3px 22px 22px / 3px 3px 14px 14px;
    box-shadow: 0 34px 50px rgb(0 0 0 / 0.2), 0 8px 12px rgb(0 0 0 / 0.08);
  }
  .macbook__base::before {
    content: ''; position: absolute; left: 50%; top: 0; width: 128px; height: 8px; translate: -50% 0;
    border-radius: 0 0 8px 8px; background: linear-gradient(180deg, #bdbdc3, #d6d6db);
  }

  /* iPad, upright, and iPhone: black all round, with a camera dot / Dynamic Island. */
  .ipad {
    left: 1140px; top: 551px; width: 328px; height: 445px; padding: 18px;
    border-radius: 28px; background: #141414;
    box-shadow: inset 0 0 0 2px #2c2c2c, 0 30px 55px rgb(0 0 0 / 0.2);
  }
  .ipad .screen { height: 100%; border-radius: 10px; }
  .iphone {
    left: 1016px; top: 787px; width: 160px; height: 328px; padding: 8px;
    border-radius: 30px; background: #141414;
    box-shadow: inset 0 0 0 2px #2e2e2e, 0 28px 45px rgb(0 0 0 / 0.24);
  }
  .iphone .screen { height: 100%; border-radius: 23px; }
  .iphone__island {
    position: absolute; left: 50%; top: 15px; width: 46px; height: 13px; translate: -50% 0;
    border-radius: 999px; background: #0a0a0a; z-index: 1;
  }
</style>
</head>
<body>
  <div class="device imac">
    <div class="imac__front"><div class="screen"><img src="${desktop}" alt="" /></div></div>
    <div class="imac__chin silver"></div>
    <div class="imac__neck"></div>
    <div class="imac__foot silver"></div>
  </div>
  <div class="device macbook">
    <div class="macbook__lid"><div class="screen"><img src="${laptop}" alt="" /></div></div>
    <div class="macbook__base silver"></div>
  </div>
  <div class="device ipad"><div class="screen"><img src="${tablet}" alt="" /></div></div>
  <div class="device iphone"><span class="iphone__island"></span><div class="screen"><img src="${phone}" alt="" /></div></div>
</body>
</html>
`;

// Makes pages/devices.webp from the screenshots in dir (a case study's pages folder), using an open Chrome.
// Returns the file name, or null if the screenshots it needs aren't there.
export async function makeDevicesMockup(browser, dir) {
  const files = fs.readdirSync(dir);
  const pages = files.filter((file) => /^\d+-.*\.webp$/.test(file)).sort();
  const pick = (...names) => names.find((name) => files.includes(name));
  const shots = {
    desktop: pages[0],
    laptop: pages[1] || pages[0],
    tablet: pick('tablet-portrait.webp', 'tablet.webp'),
    phone: pick('phone.webp'),
  };
  if (Object.values(shots).some((file) => !file)) return null;

  // Written next to the system's temporary files and opened from there, so the screenshots load as local files.
  const urls = Object.fromEntries(Object.entries(shots).map(([key, file]) => [key, pathToFileURL(path.join(dir, file)).href]));
  const htmlFile = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'devices-')), 'mockup.html');
  fs.writeFileSync(htmlFile, template(urls));

  const page = await browser.newPage();
  try {
    await page.setViewport({ width: WIDTH, height: HEIGHT, deviceScaleFactor: 1 });
    await page.goto(pathToFileURL(htmlFile).href, { waitUntil: 'load' });
    await page.evaluate(() => Promise.all([...document.images].map((img) => img.decode())));
    await page.screenshot({ path: path.join(dir, FILE), type: 'webp', quality: 90, omitBackground: true });
  } finally {
    await page.close();
    fs.rmSync(path.dirname(htmlFile), { recursive: true, force: true });
  }
  return FILE;
}

// Run from the command line: node scripts/devices-mockup.js slug
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const slug = process.argv[2];
  const dir = path.join(root, 'public', 'images', 'work', slug || '', 'pages');
  if (!slug || !fs.existsSync(dir)) {
    console.error('Give a case study whose pages have been captured, e.g.  node scripts/devices-mockup.js fraser-valley');
    process.exit(1);
  }
  const browser = await puppeteer.launch({ executablePath: CHROME });
  try {
    const file = await makeDevicesMockup(browser, dir);
    console.log(file ? `Saved public/images/work/${slug}/pages/${file}` : 'The screenshots it needs are missing: run npm run capture first.');
  } finally {
    await browser.close();
  }
}
