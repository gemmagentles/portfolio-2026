# CLAUDE.md

Gemma Gentles' portfolio (gemmagentles.dev): hand-coded HTML, SCSS and vanilla JS on a small Vite starter. Gemma is a
front-end developer and designer; explain changes in plain words and check them visually before reporting back.

## Commands

- `npm run dev` (port 5173), `npm run build` (into `dist/`), `npm run preview` (serves `dist/`, port 4173)
- `npm run test:include` tests the partials plugin (9 tests; run after touching `plugins/html-include.js`)
- `npm run new -- "Project Name"` creates a case study from `templates/case-study.html`, with
  placeholder `.svg` pictures in `public/images/work/<slug>/` (names can't contain `"`, `<` or `>`). Add the live
  site's address after the name to fill in the "Visit site" links and capture the carousel in one go. It also
  looks for a public repo named after the client on the GitHub account in `site.config.json`: "View code" links to
  it if found (`view-code.html`), otherwise shows "Repo private" (`view-code-private.html`). And it adds the case
  study to the end of `case-studies.json` (the order of the "Next case study" links).
- `npm run capture -- <slug> <site>` (`scripts/capture-pages.js`, uses `puppeteer-core` and the installed Chrome):
  screenshots every page linked in the live site's header/menus (full length, 1440 wide, WebP, in
  `public/images/work/<slug>/pages/`) plus the home page on an iPad and a phone, then rewrites the case study's
  carousel screens between its `carousel screens` markers and the "1 of N" line, and swaps the iMac, iPad and phone
  pictures in when they show placeholders or an earlier capture (pictures chosen by hand are left alone). It also
  writes a brand guidelines board, `partials/brand-board-<slug>.html` (`scripts/brand-board.js`: name, heading font
  from Google Fonts when it's there, main colours, logo and favicon), for the 4th row; a board without the "made by
  npm run capture" note is hand-made and left alone. And it makes the last row's devices mockup,
  `pages/devices.webp` (`scripts/devices-mockup.js`: an iMac, MacBook, upright iPad and iPhone drawn in HTML/CSS
  like LNDMRK's, filled with the screenshots, 1600 x 1246, see-through), swapped in over `devices.svg` or an earlier
  capture only; `node scripts/devices-mockup.js <slug>` remakes just the mockup. The site's own font files are
  never copied (licensing). Re-run it when the client's site changes.

## How the site is put together

- **Pages:** every `.html` file is built automatically (`findPages` in `plugins/html-include.js`), except files in
  `node_modules`, `dist`, `partials`, `templates`, `public`, `src`, `plugins`, `scripts`. Current pages: `/`, `work/`
  (+ case studies `work/lndmrk/`, `work/fraser-valley/`, `work/nueva-gold/`, all from the template), `contact/`,
  `design-system/` and `404.html`. (No About page: the home page's About section replaced it.)
- **Navigation:**
  - The header (`header.html`, `aria-label="Main"`) has the pages only: Home, All Work, Contact, plus the GitHub and
    LinkedIn icons and the Résumé button. It scrolls away with the page (not sticky); below md it's a menu button.
  - The home page has an "On this page" bar fixed to the bottom of the screen (`page-nav.html`,
    `aria-label="On this page"`) linking to its About, My Work, Tools, Clients, My Process and My Values (Why it
    matters) sections, each with its chapter number. It shows once the hero has gone, and `page-nav.js` marks the
    section being read with `aria-current="location"` (IntersectionObserver). To add a section: give it an `id` and
    `data-page-section` (the hook for its `scroll-margin-top` in `_page-nav.scss`), and add a link in page order.
  - Each case study has, after its rows, "Next case study" (`case-study-next.html`: the build fills in
    `{{next.href}}`/`{{next.name}}` from `case-studies.json`, the last leading back to the first) and a `cta.html`
    to Contact. The way back to all the work is the header's All Work link.
- **Partials:** `<include src="x.html" name="..."></include>` pulls in `partials/x.html`; attributes become `{{name}}`,
  `site.config.json` is `{{site.*}}`, and `{{year}}` is the year. Gotchas:
  - attribute values can't contain `>` or `"`; an unset `{{var}}` stays in the output literally;
  - a literal `<include ...>` inside an HTML comment is still processed, so never write one in a comment (describe
    the partial by file name instead);
  - nav links `<a href="/x/" data-nav="/x/">` get `aria-current` automatically; `/` only marks the home page.
- **Reusable components with settings** (set on the include): `statement.html` (`theme="light|dark"`), `cta.html`
  (eyebrow, title, title2, accent, ghost, button, href, target, note), `work-laptop.html` (href, image, height,
  address, label, priority, `variant="work-laptop--imac"`), `page-wall-lndmrk.html` (`intro`, eyebrow, title).
- **Case study pieces** (every case study shares them, so changing one changes every page; the text is
  written in each page): hero carousel `showcase-screen.html` (pos, href, image, width, height, alt, label, name) and
  `showcase-controls.html` (status); 50/50 pictures `work-split-laptop.html` (as `work-laptop.html`),
  `work-split-phone.html`, `-tablet.html`, `-devices.html` (image, width, height, alt) and `-screenshot.html` (+ focus);
  buttons `visit-site.html` (href, address), `view-code.html` (repo) for a repo you can link to, or
  `view-code-private.html` for a private one (turns into "Repo private" when clicked: `private-repo.js`,
  `_repo-button.scss`). Each case study's brand board is `brand-board-<slug>.html`.
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
  next section (otherwise its link is followed).

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
  `C:/Program Files (x86)/Google/Chrome/Application/chrome.exe`; `puppeteer-core` is a dev dependency, so
  check scripts in the scratchpad load it from the project (`createRequire(<project>/package.json)`). Run `npm run build`
  then `npx vite preview --port 4173 --strictPort`. Stop the server after each check; delete temp
  files once the batch is merged.
- **Screenshots of client sites** are captured from the live sites with headless Chrome and saved as WebP in
  `public/images/work/<client>/` (e.g. `*-full.webp` full-length pages, `services-tablet.webp`).
- **Version control:** Git, pushed to github.com/gemmagentles/portfolio-2026 (public). Commit when Gemma asks
  (clear messages), push when asked. Never make `.bak` copies; Git history replaces them.
- **Gitflow (always):** `main` only holds released, live-ready code; `develop` is where finished work collects.
  Never commit straight to `main` or `develop`. Plain `git` commands (the `git flow` helper isn't installed).
  - New work: one `feature/<short-name>` branch from `develop` per batch of work (a session's tweaks and fixes),
    not one per change: a commit for each change, merged back into `develop` with `--no-ff` once Gemma is happy
    with the batch, then deleted. Keep using the open batch branch for new requests until it's merged.
  - A separate branch only for an experiment that may be thrown away (e.g. trying several design options).
  - Checks: while working, build and screenshot just what changed (at 1440px and 390px). The full every-page check
    (every page at both widths: errors, missing files, sideways scroll, scroll-in content all revealed) runs once,
    before merging a batch or making a release.
  - Release: `release/<version>` from `develop`, final checks/version bump, merged into `main` with `--no-ff`,
    tagged `v<version>` (e.g. `v1.1.0`), then merged back into `develop`.
  - Urgent fix to the live site: `hotfix/<version>` from `main`, merged into `main` (tagged) and into `develop`.
  - Before starting work, check which branch is checked out and create the right one if needed. Ask before
    merging into `main` or tagging a release.
- **Changelog (every merge):** `CHANGELOG.md` (Keep a Changelog layout) is updated for every merge. Add each
  change's entry on the batch branch (with the change, or all together as the last commit before merging), so it
  arrives with the merge and nothing is committed straight to `develop`/`main`. Features and fixes go under
  `[Unreleased]` (Added / Changed / Fixed / Removed), in plain words about what changed on the site. A release moves
  `[Unreleased]` under `[x.y.z] - YYYY-MM-DD`, bumps `version` in `package.json` to match, and updates the compare
  links at the bottom.

## Open to-dos

- Build-time "years of experience" number (currently counted in the browser by `years.js` from 2012) plus a yearly
  rebuild, so search engines see the right number.
- Replace the placeholder text in [square brackets]: Challenges lists (the case studies, `/work/` cards), case study
  pages and the Custom Coded / EDM placeholders on `/work/`.
- Add `public/resume.pdf` (the header and footer link to it).
- Very wide screens: consider capping the full-width 50/50 section (around 1920px).
