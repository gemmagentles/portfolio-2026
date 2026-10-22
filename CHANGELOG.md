# Changelog

All notable changes to gemmagentles.dev are written down here, newest first.

The layout follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and version numbers follow
[Semantic Versioning](https://semver.org/): a big redesign bumps the first number (2.0.0), a new page or feature
the middle one (1.1.0), and a fix the last one (1.0.1).

Work merged into `develop` goes under **Unreleased**. When a release goes live, that list moves under its new
version number and date.

## [Unreleased]

### Added

- Gitflow branching rules in `CLAUDE.md`: work happens in batches on `feature/` branches (one per batch, not per
  change), plus `release/` and `hotfix/` branches, never straight on `main` or `develop`.
- This changelog, and a rule that it's updated with every merge.
- On hover and keyboard focus, the header's Résumé button turns white with dark text, and its download arrow
  nudges down and settles back like the footer's résumé link (no movement for visitors who prefer reduced motion).
- Work page v4: a "View code" button (outlined) beside "Visit site" in the 50/50 section. It links to the
  project's repo, or, when the repo is private (as for LNDMRK), clicking it makes it try to open (the arrow
  pushes up and back), then the arrow's lines reshape into a padlock as the text changes to "Repo private".
  The arrows on "Visit site" and "View code" are now drawn as lines so the two match.
- Home page hero: a giant outlined "PORTFOLIO" (the style of "NEXT" in the call to action) along the bottom,
  full width with its ends and the bottom of its letters cropped. The hero has room for it at the bottom, so it sits
  below the phone and text, not behind them. It fades and rises in gently on page load (still for visitors who
  prefer reduced motion). Screen readers skip it.
- Every case study now ends with a real "all devices" mockup like LNDMRK's: the client's site on an iMac, a
  MacBook, an iPad and an iPhone, made from its own screenshots by `npm run capture` (it replaces the placeholder,
  but never a picture chosen by hand). Fraser Valley and Nueva Gold have theirs.

### Changed

- Home page hero: the heading, the phone and the hexagons are 20% smaller.
- Home page hero on phones and tablets (below 1024px): the phone and hexagons now show, centred below the buttons
  (they used to be hidden there).
- Project notes now record the GitHub repo and drop the finished "delete the backups" to-do.
- The GitHub and LinkedIn links in the header, footer and contact page now go to the real profiles
  (github.com/gemmagentles and ca.linkedin.com/in/gemmagentles) instead of placeholders.
- The favicon is now a square in the pink-to-blue gradient with a white "G" (it was a triangle).
- The logo reads "Gemma Gentles" in title case instead of all capitals (still Oswald).
- Work page v4: the 50/50 rows no longer slide up into place as they scroll in (which opened a gap between rows).
  They stay put, and once a row is well on screen the text rises in line by line and the pictures fade in slightly
  enlarged and slowly settle (`data-reveal="late"` in `reveal.js` starts them later).
- Work page v4: the hero builds in on page load: the heading rises in, then the front page screenshot slowly slides
  up into place, the left and then the right screenshot behind it follow one at a time, and the arrows fade in
  last (it used to fade up as one block).
- Work page v4: clicking the front screen in the hero now scrolls further, so the 50/50 section starts right at
  the top of the screen, and more smoothly: a gentle ease in and out that stops if you scroll yourself.
- `npm run new` now creates case studies in the work-v4 layout (the carousel of the project's pages, then 50/50
  rows ending with "Visit site" and "View code"), with placeholder pictures for every slot. The carousel screens,
  pictures and buttons are shared partials, so a design change to them updates work-v4 and every new case study
  at once.
- `npm run capture -- slug https://site/` (and `npm run new` given the live site's address) screenshots every page
  linked in the client site's menus and puts them all in the case study's hero carousel, one screen per page, so a
  four-page site gets four screens without editing anything. The iMac in the first 50/50 row scrolls through the
  captured home page (updated on every re-capture). Floating buttons and cookie banners are left out of
  the screenshots.
- `npm run new` looks for a public repo named after the client on your GitHub account: if there is one, "View
  code" links to it; if not, it becomes the "Repo private" button.
- Case studies made with the live site's address now get a brand guidelines board like LNDMRK's, read from the site:
  its name, the font its headings use (loaded from Google Fonts when it's there), its main colours, logo and
  favicon (including accent colours that only show on hover, like LNDMRK's red link hover). All three case studies (and work-v4) now use generated boards, so every project is set up the same way;
  LNDMRK's board layout is now a shared `brand-board--bars` style.
- The LNDMRK, Fraser Valley and Nueva Gold case studies now use the new layout, each with its own site's pages
  in the carousel. LNDMRK has its full write-up, pictures and brand board (shared with work-v4); Nueva Gold has its
  intro, goals and role; Fraser Valley still needs its text. The capture also takes the home page on an iPad and a
  phone for those rows.
- Work page (/work/): a new black hero: "Featured Projects" left-aligned (with "Projects" in a thin gradient
  weight) and, beside it, an angled browser window of project screenshots in the style of the home page's "My
  Work" wall, fading into the black. The carousel is gone from the hero (each project now has its own in its case
  study), and the wall of LNDMRK pages and the two LNDMRK bento grids are hidden (their partials are kept, to bring
  back any time). Its nav bar now has the gradient, like the other work pages.

### Fixed

- Case study screenshots (carousel, iMac, devices mockup) cut the top off some sites' headers, such as Fraser
  Valley's crest: the capture now takes a plain screenshot of a page-tall window instead of a cropped one.
- The category links on the Work page (and the design system page's contents and pill example) showed stray
  hexagon bullets; their lists now have their own class, so the plain-list bullets don't apply.
- The Résumé button in the header is now black on every page (it was white on the work pages and pages with the
  plain black bar). On the black bar it has a faint outline so it still stands out. The phone menu is unchanged.
- Sections that fade in as you scroll could stay invisible if you scrolled past them quickly (a fast flick, the
  End key, or reloading halfway down a page): on the home page this hid the work browser, clients and "why it
  matters" sections. `reveal.js` now reveals anything that has passed its start point, whatever the scroll speed.

### Removed

- The old case study layout's styles (`_case-study.scss`), no longer used by any page.
- The Work page carousel's drawer and "drop" animation (styles and script), only used by the carousel removed from
  /work/.
- The old `.bak` backup files and `src-scss-before-tokens.bak.tar` (Git history replaces them).
- The unused purple paint drips animation on the home page About section (its markup, `drips.js` and
  `_drips.scss`). The page looks the same; it had been hidden.

## [1.0.0] - 2026-10-19

### Added

- First commit of the hand-coded portfolio: home, about, contact, work and the LNDMRK, Fraser Valley and Nueva
  Gold case studies, the design system page and the Work page experiments (v2, v3, v4).
- HTML partials plugin with tests, SCSS design tokens, and vanilla JS modules on a small Vite starter.
- `.gitignore` and `.gitattributes` (Unix line endings), published to GitHub as a public repo.

[Unreleased]: https://github.com/gemmagentles/portfolio-2026/compare/v1.0.0...develop
[1.0.0]: https://github.com/gemmagentles/portfolio-2026/releases/tag/v1.0.0
