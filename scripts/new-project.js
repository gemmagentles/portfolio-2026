// Creates a new case study page and placeholder images from templates/case-study.html.
//
//   npm run new -- "Project Name"
//
// Result: work/project-name/index.html and public/images/work/project-name/*.svg
// Then add a card for it on the home page (index.html) and replace the placeholder images.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const name = process.argv.slice(2).join(' ').trim();

if (!name) {
  console.error('Give the project a name, e.g.  npm run new -- "Nueva Gold"');
  process.exit(1);
}

const slug = name
  .toLowerCase()
  .normalize('NFKD')
  .replace(/\p{Diacritic}/gu, '')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '');

const pageDir = path.join(root, 'work', slug);
const pageFile = path.join(pageDir, 'index.html');
const imageDir = path.join(root, 'public', 'images', 'work', slug);

if (fs.existsSync(pageFile)) {
  console.error(`work/${slug}/index.html already exists. Pick a different name or delete it first.`);
  process.exit(1);
}

const template = fs.readFileSync(path.join(root, 'templates', 'case-study.html'), 'utf8');
const page = template.replaceAll('__NAME__', name).replaceAll('__SLUG__', slug);

fs.mkdirSync(pageDir, { recursive: true });
fs.writeFileSync(pageFile, page);

// Placeholder images so the page looks finished until real screenshots go in.
const placeholder = (width, height, label) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#d9d4ca"/>
      <stop offset="1" stop-color="#b9b2a5"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#g)"/>
  <text x="50%" y="50%" fill="#4a4640" font-family="system-ui, sans-serif" font-size="${Math.round(width / 22)}" text-anchor="middle" dominant-baseline="middle">${name} · ${label}</text>
</svg>
`;

fs.mkdirSync(imageDir, { recursive: true });
const images = [
  ['cover.svg', 1600, 1000, 'cover'],
  ['desktop.svg', 1600, 1000, 'desktop'],
  ['mobile.svg', 780, 1688, 'mobile'],
];
for (const [file, w, h, label] of images) {
  const target = path.join(imageDir, file);
  if (!fs.existsSync(target)) fs.writeFileSync(target, placeholder(w, h, label));
}

console.log(`
Created:
  work/${slug}/index.html
  public/images/work/${slug}/cover.svg, desktop.svg, mobile.svg

Next:
  1. Add a card to index.html:
     <include src="project-card.html" slug="${slug}" image="/images/work/${slug}/cover.svg" name="${name}" meta="Client website · 2026" summary="..."></include>
  2. Write the case study in work/${slug}/index.html
  3. Swap the placeholder images for real screenshots (update the file names in the page if you use .webp)
`);
