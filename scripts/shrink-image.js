// Makes a smoothly scaled-down copy of a picture that the page shows much smaller than it is (the iPad in a case
// study's 50/50 rows shows a 2360-wide capture at about 360 wide). When the browser shrinks a picture more than
// about 2 times in one go, thin lines and small text break up into pixels; halving it in steps first blends them
// smoothly instead. Save the copy at about 2 times its largest size on the page, so it stays sharp on high-density
// screens too (and the file is smaller).
// Used by scripts/capture-pages.js (npm run capture), which saves pages/tablet-800.webp next to pages/tablet.webp
// (the devices mockup draws its own iPad from the full-size one, so that stays).
//
// For a picture you chose yourself:  node scripts/shrink-image.js <picture> <new picture> <width>
//   e.g. node scripts/shrink-image.js public/images/work/lndmrk/services-tablet.webp public/images/work/lndmrk/services-tablet-800.webp 800

import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import puppeteer from 'puppeteer-core';

const CHROME = process.env.CHROME_PATH || 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe';

// Halves the picture on a canvas in the browser until one more halving would go below the width, then scales it to
// the exact width, and returns it as WebP data.
async function shrink(page, picture, width) {
  return page.evaluate(
    async ({ picture, width }) => {
      const image = new Image();
      image.src = picture;
      await image.decode();
      let canvas = document.createElement('canvas');
      canvas.width = image.width;
      canvas.height = image.height;
      canvas.getContext('2d').drawImage(image, 0, 0);
      const step = (w, h) => {
        const next = document.createElement('canvas');
        next.width = w;
        next.height = h;
        const x = next.getContext('2d');
        x.imageSmoothingQuality = 'high';
        x.drawImage(canvas, 0, 0, w, h);
        canvas = next;
      };
      while (canvas.width / 2 >= width) step(Math.round(canvas.width / 2), Math.round(canvas.height / 2));
      step(width, Math.round((canvas.height * width) / canvas.width));
      return canvas.toDataURL('image/webp', 0.95);
    },
    { picture, width },
  );
}

// Makes the copy from a picture on disk. Uses the browser it's given (capture's) or its own.
export async function shrinkImage(source, target, width, browser) {
  const own = !browser;
  if (own) browser = await puppeteer.launch({ executablePath: CHROME });
  try {
    const page = await browser.newPage();
    // The picture goes in as data (a page can't load pictures from the disk).
    const type = path.extname(source).slice(1).replace('jpg', 'jpeg');
    const data = await shrink(page, `data:image/${type};base64,${fs.readFileSync(source).toString('base64')}`, width);
    await page.close();
    fs.writeFileSync(target, Buffer.from(data.split(',')[1], 'base64'));
  } finally {
    if (own) await browser.close();
  }
}

// Run from the command line: node scripts/shrink-image.js <picture> <new picture> <width>
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [source, target, width] = process.argv.slice(2);
  if (!source || !target || !(Number(width) > 0) || !fs.existsSync(source)) {
    console.error('Give a picture, where to save the copy and its width, e.g.  node scripts/shrink-image.js in.webp out.webp 800');
    process.exit(1);
  }
  shrinkImage(source, target, Number(width))
    .then(() => console.log(`Saved ${target}`))
    .catch((error) => {
      console.error(error.message);
      process.exit(1);
    });
}
