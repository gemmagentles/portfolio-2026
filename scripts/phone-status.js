// Turns a phone screenshot into the picture for a case study's phone row (partials/work-split-phone.html): an
// iPhone status bar across the top (9:41 on the left; signal, wifi and battery on the right, either side of the
// drawn phone's Dynamic Island), then the page a little smaller, with room round it, so the site's logo, menu and
// buttons aren't cut off by the phone's rounded corners and sit clear of its edges.
// - The status bar takes the colour of the site's header, with black or white icons to suit it.
// - The room at the sides is filled with the page's own colour at each edge, so a full-width band (a hero, a coloured
//   header) still runs edge to edge.
// - The picture keeps its size (780 wide); the page's bottom is cut off a little, where the row hides it anyway.
// Used by scripts/capture-pages.js (npm run capture), which saves pages/phone-status.webp next to pages/phone.webp
// (the devices mockup draws its own phone, so it keeps the plain one).
//
// For a phone picture you chose yourself:  node scripts/phone-status.js <picture> <new picture>
//   e.g. node scripts/phone-status.js public/images/work/lndmrk/contact-form-mobile.webp public/images/work/lndmrk/contact-form-mobile-padded.webp

import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import puppeteer from 'puppeteer-core';

const CHROME = process.env.CHROME_PATH || 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe';

// Sizes in the picture's pixels (a 390-wide phone screenshot saved at 2x, so 30 is 15 CSS pixels).
const SIDES = 30; // room at each side
const BAR = 100; // the status bar's height (the site's header starts below it)
const MIDDLE = 41; // the status bar's centre line, level with the Dynamic Island in partials/work-split-phone.html

// Draws the new picture on a canvas in the browser and returns it as WebP data.
async function draw(page, picture) {
  // Inter for the time (close to the iPhone's own font), from Google Fonts like the site; a system font if offline.
  await page.setContent(
    '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@600&display=swap">',
    { waitUntil: 'networkidle0' },
  );
  return page.evaluate(
    async ({ picture, P, T, cy }) => {
      await document.fonts.load('600 34px Inter').catch(() => {});
      const shot = new Image();
      shot.src = picture;
      await shot.decode();

      const W = shot.width;
      const H = shot.height;
      const pageHeight = Math.round(H * ((W - 2 * P) / W));
      const canvas = document.createElement('canvas');
      canvas.width = W;
      canvas.height = H;
      const x = canvas.getContext('2d');
      x.imageSmoothingQuality = 'high';
      x.drawImage(shot, P, T, W - 2 * P, pageHeight); // the page, a little smaller

      // The colour of one pixel, a few pixels inside the page's edge.
      const inset = 3;
      const colour = (X, Y) => x.getImageData(X, Y, 1, 1).data;
      const css = ([r, g, b]) => `rgb(${r},${g},${b})`;

      // The sides, row by row in the page's own colour at each edge.
      const bottom = Math.min(H, T + pageHeight);
      for (let y = T; y < bottom; y++) {
        x.fillStyle = css(colour(P + inset, y));
        x.fillRect(0, y, P, 1);
        x.fillStyle = css(colour(W - P - 1 - inset, y));
        x.fillRect(W - P, y, P, 1);
      }
      if (bottom < H) {
        x.fillStyle = css(colour(P + inset, bottom - 1));
        x.fillRect(0, bottom, W, H - bottom);
      }

      // The status bar, in the header's colour, with black icons on a light header and white on a dark one.
      const bar = colour(W / 2, T + inset);
      x.fillStyle = css(bar);
      x.fillRect(0, 0, W, T);
      const ink = bar[0] * 0.299 + bar[1] * 0.587 + bar[2] * 0.114 > 140 ? '#111' : '#fff';
      x.fillStyle = ink;
      x.strokeStyle = ink;

      // The time, centred in the space left of the Dynamic Island.
      x.font = '600 34px Inter, system-ui, sans-serif';
      x.textAlign = 'center';
      x.textBaseline = 'middle';
      x.fillText('9:41', 140, cy + 2);

      // Signal: four bars, rising.
      [9, 14, 19, 24].forEach((h, n) => {
        x.beginPath();
        x.roundRect(572 + n * 9.5, cy + 12 - h, 6.5, h, 1.5);
        x.fill();
      });

      // Wifi: a wedge and two arcs, opening upwards.
      const wx = 640;
      const wy = cy + 11;
      x.lineCap = 'round';
      x.lineWidth = 4.6;
      [15.5, 23.5].forEach((r) => {
        x.beginPath();
        x.arc(wx, wy, r, Math.PI * 1.25, Math.PI * 1.75);
        x.stroke();
      });
      x.beginPath();
      x.moveTo(wx, wy + 1);
      x.arc(wx, wy + 1, 9, Math.PI * 1.25, Math.PI * 1.75);
      x.closePath();
      x.fill();

      // Battery: a faint outline and nub, and the charge inside.
      const bx = 670;
      const by = cy - 11;
      x.globalAlpha = 0.4;
      x.lineWidth = 2.2;
      x.beginPath();
      x.roundRect(bx, by, 46, 22, 6);
      x.stroke();
      x.beginPath();
      x.roundRect(bx + 48.5, by + 7, 3, 8, [0, 2, 2, 0]);
      x.fill();
      x.globalAlpha = 1;
      x.beginPath();
      x.roundRect(bx + 3.5, by + 3.5, 32, 15, 3);
      x.fill();

      return canvas.toDataURL('image/webp', 0.92);
    },
    { picture, P: SIDES, T: BAR, cy: MIDDLE },
  );
}

// Makes the new picture from a phone screenshot on disk. Uses the browser it's given (capture's) or its own.
export async function makePhoneStatus(source, target, browser) {
  const own = !browser;
  if (own) browser = await puppeteer.launch({ executablePath: CHROME });
  try {
    const page = await browser.newPage();
    // The screenshot goes in as data (a page can't load pictures from the disk).
    const type = path.extname(source).slice(1).replace('jpg', 'jpeg');
    const data = await draw(page, `data:image/${type};base64,${fs.readFileSync(source).toString('base64')}`);
    await page.close();
    fs.writeFileSync(target, Buffer.from(data.split(',')[1], 'base64'));
  } finally {
    if (own) await browser.close();
  }
}

// Run from the command line: node scripts/phone-status.js <picture> <new picture>
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [source, target] = process.argv.slice(2);
  if (!source || !target || !fs.existsSync(source)) {
    console.error('Give a phone screenshot and where to save the new one, e.g.  node scripts/phone-status.js in.webp out.webp');
    process.exit(1);
  }
  makePhoneStatus(source, target)
    .then(() => console.log(`Saved ${target}`))
    .catch((error) => {
      console.error(error.message);
      process.exit(1);
    });
}
