// Creates a new case study page (in the case study layout: a carousel of the project's pages, then 50/50 rows) and
// placeholder images from templates/case-study.html.
//
//   npm run new -- "Project Name"
//   npm run new -- "Project Name" https://www.client-site.com/
//
// Result: work/project-name/index.html and public/images/work/project-name/*.svg
// It also checks the GitHub account in site.config.json for a repo named after the client for the "View code"
// button (a link if there is one, "Repo private" if not).
// With the live site's address it also fills in the "Visit site" links and screenshots every page of the site into
// the hero carousel (scripts/capture-pages.js, the same as npm run capture).
// Then add a card for it on the home page (index.html), write the case study and replace the placeholder images.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { capturePages } from './capture-pages.js';

const root = fileURLToPath(new URL('..', import.meta.url));
const args = process.argv.slice(2);
const site = args.find((arg) => /^https?:\/\//.test(arg));
const name = args.filter((arg) => arg !== site).join(' ').trim();

if (!name) {
  console.error('Give the project a name, e.g.  npm run new -- "Nueva Gold"  (and its live site after it, if it has one)');
  process.exit(1);
}

// The name goes into partial settings (e.g. alt="The Name home page"), which can't hold these characters.
if (/["<>]/.test(name)) {
  console.error('The project name can\'t contain " < or >. Leave them out (you can add them to the page text later).');
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
let page = template.replaceAll('__NAME__', name).replaceAll('__SLUG__', slug);

// The live site's address in the "Visit site" links and the iMac's address bar (e.g. "fraservalleygaels.com").
if (site) {
  const address = new URL(site).hostname.replace(/^www\./, '');
  page = page.replaceAll('https://example.com', site).replaceAll('[example.com]', address);
}

// "View code": look for a public repo named after the client on the GitHub account in site.config.json. A match
// makes the button a link to it (view-code.html); otherwise it stays the "Repo private" button the template has.
// Names are compared ignoring case, spaces and dashes: an exact match first, then a repo whose name contains the
// client's ("lndmrk-website" for LNDMRK) or is contained in it ("fraser-valley" for Fraser Valley Gaels).
const compact = (text) => text.toLowerCase().replace(/[^a-z0-9]/g, '');

async function findRepo() {
  const config = JSON.parse(fs.readFileSync(path.join(root, 'site.config.json'), 'utf8'));
  const user = config.github?.match(/github\.com\/([^/]+)/)?.[1];
  if (!user) return { note: 'no GitHub address in site.config.json' };

  const response = await fetch(`https://api.github.com/users/${user}/repos?per_page=100`, {
    headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'portfolio-new-project' },
  });
  if (!response.ok) return { note: `GitHub answered ${response.status}` };

  const repos = await response.json();
  const client = compact(name);
  const exact = repos.find((repo) => compact(repo.name) === client);
  const close = repos
    .filter((repo) => {
      const repoName = compact(repo.name);
      return repoName.includes(client) || (repoName.length >= 4 && client.includes(repoName));
    })
    .sort((a, b) => a.name.length - b.name.length)[0];
  const repo = exact || close;
  return repo ? { url: repo.html_url } : { note: `no repo on github.com/${user} matches "${name}"` };
}

let codeNote;
try {
  const { url, note } = await findRepo();
  if (url) {
    page = page.replace('<include src="view-code-private.html"></include>', `<include src="view-code.html" repo="${url}"></include>`);
    codeNote = `"View code" links to ${url}`;
  } else {
    codeNote = `"View code" shows "Repo private" (${note})`;
  }
} catch (error) {
  codeNote = `"View code" shows "Repo private" (couldn't reach GitHub: ${error.message})`;
}

fs.mkdirSync(pageDir, { recursive: true });
fs.writeFileSync(pageFile, page);

// Add it to the end of the case study list, which sets each one's "Next case study" link (the last leads back to the
// first), so the one that was last now leads here.
const listFile = path.join(root, 'case-studies.json');
const list = fs.existsSync(listFile) ? JSON.parse(fs.readFileSync(listFile, 'utf8')) : [];
if (!list.some((study) => study.slug === slug)) {
  list.push({ slug, name });
  // One case study per line, as the file is written by hand: { "slug": "...", "name": "..." }
  const lines = list.map((study) => `  { "slug": ${JSON.stringify(study.slug)}, "name": ${JSON.stringify(study.name)} }`);
  fs.writeFileSync(listFile, `[\n${lines.join(',\n')}\n]\n`);
}

// Placeholder images so the page looks finished until real screenshots go in. The label sits near the top of tall
// full-length pages (where it's seen first) and in the middle of the rest.
const placeholder = (width, height, label) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#d9d4ca"/>
      <stop offset="1" stop-color="#b9b2a5"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#g)"/>
  <text x="50%" y="${Math.min(height / 2, width / 3)}" fill="#4a4640" font-family="system-ui, sans-serif" font-size="${Math.round(width / 22)}" text-anchor="middle" dominant-baseline="middle">${name} · ${label}</text>
</svg>
`;

// One for each picture in the template (the full-length pages are 1440 wide, as captured from a desktop browser),
// plus cover.svg for the project's card on the home page.
fs.mkdirSync(imageDir, { recursive: true });
const images = [
  ['cover.svg', 1600, 1000, 'cover'],
  ['home-full.svg', 1440, 3600, 'home page, full length'],
  ['about-full.svg', 1440, 3000, 'about page, full length'],
  ['contact-full.svg', 1440, 2000, 'contact page, full length'],
  ['mobile.svg', 780, 1688, 'phone'],
  ['tablet.svg', 2360, 1640, 'iPad'],
  ['screenshot.svg', 1600, 1000, 'screenshot'],
  ['devices.svg', 1600, 1246, 'devices mockup'],
];
for (const [file, w, h, label] of images) {
  const target = path.join(imageDir, file);
  if (!fs.existsSync(target)) fs.writeFileSync(target, placeholder(w, h, label));
}

console.log(`
Created:
  work/${slug}/index.html
  public/images/work/${slug}/ (${images.map(([file]) => file).join(', ')})

${codeNote}.`);

// Screenshot every page of the live site into the carousel, then drop the placeholders it replaced.
if (site) {
  console.log(`\nCapturing every page of ${site} for the carousel:`);
  try {
    const shots = await capturePages(slug, site);
    const html = fs.readFileSync(pageFile, 'utf8');
    for (const file of ['home-full.svg', 'about-full.svg', 'contact-full.svg', 'mobile.svg', 'tablet.svg', 'screenshot.svg', 'devices.svg']) {
      if (!html.includes(`/${slug}/${file}`)) fs.rmSync(path.join(imageDir, file), { force: true });
    }
    console.log(`The carousel shows ${shots.length} pages: ${shots.map((s) => s.name).join(', ')} (in public/images/work/${slug}/pages/).`);
  } catch (error) {
    console.log(`Couldn't capture the site (${error.message}). The carousel keeps its placeholders; try again with:
  npm run capture -- ${slug} ${site}`);
  }
}

console.log(`
Next:
  1. Add a card to the CMS Websites row in work/index.html:
     <include src="work-card-site.html" href="/work/${slug}/" image="/images/work/${slug}/cover.svg" name="${name}" type="Website"></include>
  2. Write the case study in work/${slug}/index.html (replace everything in [square brackets])
  3. Swap the placeholder images for real screenshots (update the file names and sizes in the page if you use .webp)
`);
