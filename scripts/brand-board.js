// Makes a brand guidelines board for a case study from the client's live site, in the bars layout
// (.brand-board--bars in _work-bento.scss): their name as the wordmark, their heading font as a big "Aa", their main
// colours as stacked bars, and their logo and favicon. Used by scripts/capture-pages.js (npm run capture).
//
// From the home page it reads:
// - the name: the site's og:site_name, or the start of its <title>
// - the font: the one its main heading uses, loaded from Google Fonts when Google has it (the site's own font files
//   aren't copied, as they're often paid fonts licensed only to the client's site)
// - the colours: every colour on the page, weighted by how much of it they cover (backgrounds by area, text by size
//   and length), with bright colours counted more, as an accent button covers little but matters; then the four most
//   used that look clearly different from each other. Colours that only appear on hover or focus (read from the
//   site's stylesheets) count as accents too
// - the logo: the first image or SVG in the site's header (the home link's if there is one), and the favicon
// It saves the logo and favicon in public/images/work/<slug>/brand/ and writes partials/brand-board-<slug>.html.
// A board without the "made by npm run capture" line at its top is one you've made or edited by hand: it's left alone.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
export const MARKER = 'made by npm run capture';

const escape = (text) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const hex = (rgb) => `#${rgb.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')}`;
const luminance = ([r, g, b]) => (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
const saturation = ([r, g, b]) => {
  const max = Math.max(r, g, b) / 255;
  const min = Math.min(r, g, b) / 255;
  const light = (max + min) / 2;
  return max === min ? 0 : (max - min) / (1 - Math.abs(2 * light - 1));
};
const distance = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

// Everything the board needs, read from the page in the browser.
function readPage() {
  const parse = (colour) => {
    const match = colour.match(/rgba?\(([^)]+)\)/);
    if (!match) return null;
    const [r, g, b, a = 1] = match[1].split(/[\s,/]+/).filter(Boolean).map(Number);
    return a < 0.6 ? null : [r, g, b];
  };
  const tally = new Map();
  const add = (colour, weight) => {
    const rgb = parse(colour);
    if (!rgb || !weight) return;
    const key = rgb.join(',');
    tally.set(key, (tally.get(key) || 0) + weight);
  };

  // The page background (white if the site doesn't set one), then every visible element.
  const pageBackground = parse(getComputedStyle(document.body).backgroundColor) ||
    parse(getComputedStyle(document.documentElement).backgroundColor) || [255, 255, 255];
  add(`rgb(${pageBackground.join(',')})`, innerWidth * Math.min(document.documentElement.scrollHeight, 6000) * 0.3);
  for (const element of document.querySelectorAll('body *')) {
    const box = element.getBoundingClientRect();
    if (box.width < 2 || box.height < 2) continue;
    const style = getComputedStyle(element);
    if (style.visibility === 'hidden' || style.display === 'none' || Number(style.opacity) < 0.5) continue;
    add(style.backgroundColor, box.width * Math.min(box.height, 3000));
    const text = [...element.childNodes].filter((node) => node.nodeType === 3).map((node) => node.textContent.trim()).join('');
    if (text) add(style.color, text.length * parseFloat(style.fontSize) ** 2);
    if (parseFloat(style.borderTopWidth) >= 2) add(style.borderTopColor, box.width * parseFloat(style.borderTopWidth) * 4);
  }

  // Colours that only show on hover or focus (a link that turns red, say) aren't on screen at rest, so they're read
  // from the site's own stylesheets instead and counted as accents. (WordPress's screen-reader styles are skipped,
  // and stylesheets from other sites can't be read.)
  const probe = document.createElement('i');
  document.body.append(probe);
  const accentWeight = innerWidth * 900 * 0.05;
  const readRules = (rules) => {
    for (const rule of rules) {
      if (rule.cssRules && !(rule instanceof CSSStyleRule)) readRules(rule.cssRules);
      if (!(rule instanceof CSSStyleRule) || !/:(hover|focus|active)/.test(rule.selectorText) || /screen-reader/.test(rule.selectorText)) continue;
      for (const property of ['color', 'background-color', 'border-color', 'border-bottom-color', 'text-decoration-color']) {
        const value = rule.style.getPropertyValue(property);
        if (!value || /^(initial|inherit|unset|currentcolor|transparent)$/i.test(value.trim())) continue;
        probe.style.color = '';
        // The last colour of a shorthand like "currentcolor currentcolor rgb(143, 29, 44)".
        probe.style.color = (value.match(/(rgba?\([^)]*\)|hsla?\([^)]*\)|#[0-9a-f]{3,8}|[a-z]+)\s*$/i) || [value])[0];
        if (probe.style.color) add(getComputedStyle(probe).color, accentWeight);
      }
    }
  };
  for (const sheet of document.styleSheets) {
    try {
      readRules(sheet.cssRules);
    } catch {
      // another site's stylesheet: not readable
    }
  }
  probe.remove();

  const heading = document.querySelector('h1') || document.querySelector('h2') || document.body;
  const header = document.querySelector('header') || document.querySelector('nav') || document.body;
  let headerBackground = null;
  for (let element = header; element && !headerBackground; element = element.parentElement) {
    headerBackground = parse(getComputedStyle(element).backgroundColor);
  }

  // The logo: the picture in a link to the home page (the menu's "Home" link has none, so it's skipped), otherwise the
  // first decent-sized picture in the header. A logo set as text (no picture) gets the name as a wordmark instead.
  const bigEnough = (picture) => picture.getBoundingClientRect().width >= 24;
  const homeLinks = [...header.querySelectorAll('a[href]')].filter((a) => ['/', '/home', '/home/'].includes(new URL(a.href, location.href).pathname));
  const picture = homeLinks.flatMap((a) => [...a.querySelectorAll('img, svg')]).find(bigEnough) ||
    [...header.querySelectorAll('img, svg')].find(bigEnough);
  let logo = null;
  if (picture?.tagName.toLowerCase() === 'img') {
    logo = { type: 'img', src: picture.currentSrc || picture.src };
  } else if (picture) {
    const copy = picture.cloneNode(true);
    copy.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    copy.setAttribute('style', `color: ${getComputedStyle(picture).color}`); // for logos drawn in currentColor
    logo = { type: 'svg', markup: copy.outerHTML };
  }
  if (logo) {
    const box = picture.getBoundingClientRect();
    logo.wide = box.width / box.height >= 2; // a wordmark, rather than a square-ish badge or crest
  }

  const icon = document.querySelector('link[rel="apple-touch-icon"]') || document.querySelector('link[rel~="icon"]');

  return {
    name: document.querySelector('meta[property="og:site_name"]')?.content || document.title.split(/\s+[|–—-]\s+/)[0],
    fonts: getComputedStyle(heading).fontFamily,
    colours: [...tally].map(([key, weight]) => ({ rgb: key.split(',').map(Number), weight })),
    headerBackground: headerBackground || pageBackground,
    logo,
    favicon: icon ? icon.href : new URL('/favicon.ico', location.href).href,
  };
}

// The four colours: most used first, bright ones counted three times over, each clearly different from the others.
function pickColours(colours) {
  const ranked = colours
    .map((colour) => ({ ...colour, score: colour.weight * (1 + 3 * saturation(colour.rgb)) }))
    .sort((a, b) => b.score - a.score);
  const picked = [];
  for (const { rgb } of ranked) {
    if (picked.every((other) => distance(other, rgb) > 40)) picked.push(rgb);
    if (picked.length === 4) break;
  }
  // Darkest first (it's the cover's background and the first bar), then lightest to darkest.
  const darkest = picked.reduce((a, b) => (luminance(b) < luminance(a) ? b : a));
  return [darkest, ...picked.filter((rgb) => rgb !== darkest).sort((a, b) => luminance(b) - luminance(a))];
}

// Saves a file from the site (or a data: address) as public/images/work/<slug>/brand/<name>.<its type>.
async function download(url, dir, name) {
  let data;
  let type;
  if (url.startsWith('data:')) {
    const [, mime, base64, body] = url.match(/^data:([^;,]+)(;base64)?,(.*)$/) || [];
    data = base64 ? Buffer.from(body, 'base64') : Buffer.from(decodeURIComponent(body));
    type = mime;
  } else {
    const response = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 portfolio-capture' } });
    if (!response.ok) throw new Error(`${response.status}`);
    data = Buffer.from(await response.arrayBuffer());
    type = response.headers.get('content-type') || '';
  }
  const extension = /svg/.test(type) ? 'svg' : /png/.test(type) ? 'png' : /webp/.test(type) ? 'webp' : /jpe?g/.test(type) ? 'jpg' : /icon|ico/.test(type) ? 'ico' : path.extname(new URL(url).pathname).slice(1) || 'png';
  const file = `${name}.${extension}`;
  fs.writeFileSync(path.join(dir, file), data);
  return file;
}

// Sites often name their own font files like "Cormorant-Bold" or "RobotoCondensed": this gives the family
// ("Cormorant", "Roboto Condensed") and the weight its name ends in (700), for the label and for Google Fonts.
const WEIGHTS = { thin: 100, extralight: 200, ultralight: 200, light: 300, regular: 400, book: 400, medium: 500, semibold: 600, demibold: 600, bold: 700, extrabold: 800, ultrabold: 800, black: 900, heavy: 900 };
function readFontName(raw) {
  let name = raw.replace(/["']/g, '').trim();
  let weight = 400;
  const suffix = name.match(/[-_ ]?(thin|extralight|ultralight|light|regular|book|medium|semibold|demibold|bold|extrabold|ultrabold|black|heavy)$/i);
  if (suffix) {
    weight = WEIGHTS[suffix[1].toLowerCase()];
    name = name.slice(0, suffix.index);
  }
  name = name.replace(/[-_]+/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2').trim();
  return { family: name, weight };
}

// The Google Fonts address for this family at this weight (or its regular weight), if Google has it.
// The site's own font files aren't copied: they're often paid fonts licensed only to the client's site.
async function googleFont(family, weight) {
  if (/^(serif|sans serif|monospace|system ui|apple system|ui \w+)$/i.test(family)) return null;
  const base = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family).replace(/%20/g, '+')}`;
  for (const [url, loaded] of [[`${base}:wght@${weight}&display=swap`, weight], [`${base}&display=swap`, 400]]) {
    try {
      const response = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (response.ok) return { url, weight: loaded };
    } catch {
      return null;
    }
  }
  return null;
}

// Reads the brand from the page (already on the site's home page) and writes the board. Returns its partial's name,
// or null if a hand-made board is already there.
export async function makeBrandBoard(page, slug, project) {
  const partialFile = path.join(root, 'partials', `brand-board-${slug}.html`);
  if (fs.existsSync(partialFile) && !fs.readFileSync(partialFile, 'utf8').includes(MARKER)) return null;

  await page.evaluate(() => document.fonts.ready);
  const brand = await page.evaluate(readPage);

  const dir = path.join(root, 'public', 'images', 'work', slug, 'brand');
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });

  let logo = '';
  try {
    if (brand.logo?.type === 'svg') {
      fs.writeFileSync(path.join(dir, 'logo.svg'), brand.logo.markup);
      logo = 'logo.svg';
    } else if (brand.logo) {
      logo = await download(brand.logo.src, dir, 'logo');
    }
  } catch {
    logo = '';
  }
  let favicon = '';
  try {
    favicon = await download(brand.favicon, dir, 'favicon');
  } catch {
    favicon = '';
  }

  const [ink, ...rest] = pickColours(brand.colours);
  const paper = rest.length ? rest[0] : [255, 255, 255];
  // The heading font: from Google Fonts if it's there, otherwise the site's own fallback (serif or sans-serif), with
  // its real name on the label either way.
  const stack = brand.fonts.split(',').map((family) => family.replace(/["']/g, '').trim()).filter(Boolean);
  const { family, weight } = readFontName(stack[0]);
  const font = await googleFont(family, weight);
  const fallback = stack.find((name) => /^(serif|sans-serif)$/i.test(name)) || 'serif';
  const fontStack = font ? `'${family}', ${fallback}` : fallback;
  const fontWeight = font ? font.weight : 500;
  const fontNote = /^(serif|sans serif|system ui|apple system)$/i.test(family) ? 'System font' : `${family}${weight === 400 ? '' : ` (${Object.keys(WEIGHTS).find((key) => WEIGHTS[key] === weight)})`}`;
  const fontLink = font?.url;
  const name = escape((brand.name || project).trim()) || escape(project);
  const swatches = [ink, ...rest].map((rgb) => `        <li style="--swatch: ${hex(rgb)}; color: ${luminance(rgb) < 0.5 ? '#fff' : '#111'}">${hex(rgb).toUpperCase()}</li>`);
  const images = `/images/work/${slug}/brand`;

  const html = `<!--
  The ${escape(project)} brand guidelines board as a 50/50 row's picture: their wordmark, the font of their headings,
  their main colours, logo and favicon, read from their live site (${MARKER}, scripts/brand-board.js).
  Re-capturing rewrites it; to keep your own changes, delete the "${MARKER}" words in this note.
  Styles: .brand-board in src/scss/components/_work-bento.scss, the panel in _work-split.scss.
-->
${fontLink ? `<link rel="stylesheet" href="${fontLink}" />\n` : ''}<div class="work-split__shot work-split__shot--board">
  <div class="brand-board brand-board--bars" style="--board-ink: ${hex(ink)}; --board-paper: ${hex(paper)}; --serif: ${fontStack}">
    <div class="brand-board__panel brand-board__panel--cover">
      <p class="brand-board__wordmark">${name}</p>
      <p class="brand-board__meta"><span>Brand guidelines</span></p>
    </div>
    <div class="brand-board__panel brand-board__panel--type">
      <p class="brand-board__label">Typography</p>
      <p class="brand-board__specimen" aria-hidden="true" style="font-weight: ${fontWeight}">A<i>a</i></p>
      <p class="brand-board__note">${escape(fontNote)}</p>
    </div>
    <div class="brand-board__panel brand-board__panel--colours">
      <p class="brand-board__label">Colours</p>
      <ul class="brand-board__swatches">
${swatches.join('\n')}
      </ul>
    </div>
    <div class="brand-board__panel brand-board__marks" style="background: ${hex(brand.headerBackground)}">
${logo ? `      <img class="brand-board__logo" src="${images}/${logo}" alt="${escape(project)} logo" style="height: ${brand.logo.wide ? 22 : 40}px" loading="lazy" decoding="async" />` : `      <p class="brand-board__wordmark">${name}</p>`}
${favicon ? `      <img class="brand-board__favicon" src="${images}/${favicon}" alt="${escape(project)} favicon" width="64" height="64" loading="lazy" decoding="async" />` : ''}
    </div>
  </div>
</div>
`;
  fs.writeFileSync(partialFile, html.replace(/\n\n+(?=\s*<\/div>)/g, '\n'));
  return `brand-board-${slug}.html`;
}
