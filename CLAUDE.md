# CLAUDE.md

Gemma Gentles' portfolio (gemmagentles.dev): hand-coded HTML, SCSS and vanilla JS on a small Vite starter. Gemma is a
front-end developer and designer; explain changes in plain words and check them visually before reporting back.

## Commands

- `npm run dev` (port 5173), `npm run build` (into `dist/`), `npm run preview` (serves `dist/`, port 4173)
- `npm run test:include` tests the partials plugin (8 tests; run after touching `plugins/html-include.js`)
- `npm run new -- "Project Name"` creates a case study from `templates/case-study.html`

## How the site is put together

- **Pages:** every `.html` file is built automatically (`findPages` in `plugins/html-include.js`), except files in
  `node_modules`, `dist`, `partials`, `templates`, `public`, `src`, `plugins`, `scripts`. Current pages: `/`, `about/`,
  `contact/`, `work/` (+ case studies `work/lndmrk/`, `work/fraser-valley/`, `work/nueva-gold/`), `design-system/`,
  and the Work page experiments `work-v2/`, `work-v3/`, `work-v4/` (v4 is the current favourite).
- **Partials:** `<include src="x.html" name="..."></include>` pulls in `partials/x.html`; attributes become `{{name}}`,
  `site.config.json` is `{{site.*}}`, and `{{year}}` is the year. Gotchas:
  - attribute values can't contain `>` or `"`; an unset `{{var}}` stays in the output literally;
  - a literal `<include ...>` inside an HTML comment is still processed, so never write one in a comment (describe
    the partial by file name instead);
  - nav links `<a href="/x/" data-nav="/x/">` get `aria-current` automatically; `/` only marks the home page.
- **Reusable components with settings** (set on the include): `statement.html` (`theme="light|dark"`), `cta.html`
  (eyebrow, title, title2, accent, ghost, button, href, target, note), `work-laptop.html` (href, image, height,
  address, label, priority, `variant="work-laptop--imac"`), `page-wall-lndmrk.html` (`intro`, eyebrow, title).
- **SCSS** (`src/scss`, all imported in `main.scss`): `abstracts/` (Sass-only: breakpoints, `$container-max`,
  `$header-height`, mixins), `base/` (`_root.scss` CSS variables, reset, typography), `layout/`, `components/` (one
  partial per component), `pages/`. Start partials with `@use '../abstracts' as *;`.
  - Breakpoints: `@include mq(md)` (from), `mq-down(md)` (below), `mq-between(md, lg)`. Never hand-type `@media` widths.
  - Colours, fonts, spacing and type sizes are CSS variables in `_root.scss` (`--ink`, `--paper`, `--white`,
    `--black`, `--primary-color`, `--secondary-color`, `--purple-color`, `--brand-gradient`, `--space-*`, `--text-*`).
    Use them rather than hex values. SCSS only feeds CSS (`#{$var}`), never the other way round; no Sass colour
    functions on CSS variables (use `color-mix()`).
  - The reset strips list padding/bullets from `ul[class]`, so list padding needs extra specificity
    (e.g. `.block &`). `[hidden]` is `display: none !important`.
  - `motion-ok` mixin wraps animation; respect `prefers-reduced-motion`. `hex-bullet` mixin draws the hexagon bullets.
- **JS:** `src/js/main.js` starts one module per feature from `src/js/modules/`. `wave.js` is switched off.
  `showcase.js` drives the carousel (only one per page); `data-showcase="scroll"` makes the front screen scroll to the
  next section instead of opening a drawer.

## Rules and preferences

- **BEM for every class:** `block`, `block__element`, `block--modifier`; states as `is-*` / `has-*`. No Tailwind or
  utility classes. Don't reuse another block's element class in a new component; give it its own.
- **Fonts:** all headings (h1–h3) and the logo Oswald (`--font-heading--primary`); paragraphs, links and lists Inter;
  eyebrows/labels Space Mono. Client brand boards use the client's fonts (Bodoni Moda for LNDMRK, Cormorant for
  Nueva Gold).
- **Look:** bullets are hexagon outlines (`hex-bullet`); white text cards; the 50/50 section (`work-split--full`) is
  full width with text blocks and the brand board centred in their halves, every row the same height (`--row-h`).
- **Comments** explain what something is and why, in plain words, like the existing ones. Keep that density.
- **Before saying a visual change is done,** build and check it in headless Chrome at 1440px and 390px wide (plus
  other widths when layout depends on it), measuring with `getBoundingClientRect` where spacing matters. Chrome is at
  `C:/Program Files (x86)/Google/Chrome/Application/chrome.exe`; install `puppeteer-core` in a temp folder, run
  `npm run build` then `npx vite preview --port 4173 --strictPort`, and stop the server and delete the temp folder after.
- **Screenshots of client sites** are captured from the live sites with headless Chrome and saved as WebP in
  `public/images/work/<client>/` (e.g. `*-full.webp` full-length pages, `services-tablet.webp`).
- **Version control:** Git, pushed to github.com/gemmagentles/portfolio-2026 (public). Commit when Gemma asks
  (clear messages), push when asked. Never make `.bak` copies; Git history replaces them.
- **Gitflow (always):** `main` only holds released, live-ready code; `develop` is where finished work collects.
  Never commit straight to `main` or `develop`. Plain `git` commands (the `git flow` helper isn't installed).
  - New work: `feature/<short-name>` from `develop`, merged back into `develop` with `--no-ff`, then deleted.
  - Release: `release/<version>` from `develop`, final checks/version bump, merged into `main` with `--no-ff`,
    tagged `v<version>` (e.g. `v1.1.0`), then merged back into `develop`.
  - Urgent fix to the live site: `hotfix/<version>` from `main`, merged into `main` (tagged) and into `develop`.
  - Before starting work, check which branch is checked out and create the right one if needed. Ask before
    merging into `main` or tagging a release.
- **Changelog (every merge):** `CHANGELOG.md` (Keep a Changelog layout) is updated for every merge. Add the entry
  as the last commit on the branch before merging, so it arrives with the merge and nothing is committed straight
  to `develop`/`main`. Features and fixes go under `[Unreleased]` (Added / Changed / Fixed / Removed), in plain
  words about what changed on the site. A release moves `[Unreleased]` under `[x.y.z] - YYYY-MM-DD`, bumps
  `version` in `package.json` to match, and updates the compare links at the bottom.

## Open to-dos

- Build-time "years of experience" number (currently counted in the browser by `years.js` from 2012) plus a yearly
  rebuild, so search engines see the right number.
- Replace the placeholder text in [square brackets]: Challenges lists (work-v4, work-v3, `/work/` cards), case study
  pages, the `/work/` carousel drawer and the Custom Coded / EDM placeholders on `/work/`.
- Add `public/resume.pdf` (the header and footer link to it).
- On phones, the `/work/` category links show stray bullets; at about 800px wide the header capsule overlaps the logo
  and Résumé button.
- Very wide screens: consider capping the full-width 50/50 section (around 1920px).
