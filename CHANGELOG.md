# Changelog

All notable changes to gemmagentles.dev are written down here, newest first.

The layout follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and version numbers follow
[Semantic Versioning](https://semver.org/): a big redesign bumps the first number (2.0.0), a new page or feature
the middle one (1.1.0), and a fix the last one (1.0.1).

Work merged into `develop` goes under **Unreleased**. When a release goes live, that list moves under its new
version number and date.

## [Unreleased]

### Removed

- Unused sections that were hidden or replaced, with their styles: the curved wave edges between sections, the LNDMRK
  bento grid, full-width cards, page wall and page spread, the hero's side phones and hexagon bands (and the script
  that made them), the old project cards and the 3D turning ring carousel. Nothing on the site looks different.
- Leftover styles for things no page uses any more: the old home page layout (section heading, work grid, intro), the
  browser-window and phone frames in the 50/50 rows, the Work page card placeholder, the clients caption and the
  brand board tagline.
- The logo experiments in `public/images/` (animated logo GIFs and videos and the earlier logo PNGs), about 7 MB.

### Changed

- The brand board styles moved from `_work-bento.scss` into their own `_brand-board.scss`.
- `.gitignore` now skips `.wrangler/`, the deploy tool's temporary files, so they can't be committed by mistake.
- `npm run new` now suggests adding the new case study's card to the Work page, not the old home page project cards.
- The design system page matches the site again: the right purple (#A66BE3), the `--black`, `--ink`, `--paper` and
  `--white` tokens, the greys and green the pages use, the fixed 42px section heading size, the 16px card corners,
  the header's springy glide and the padlock's easing. Fixed examples that no longer matched (button hovers are
  purple, the logo is Oswald, the call-to-action button is white, the work card has no serif) and replaced the
  broken "Open to work" pill with the call to action's dot label.
- The design system page's header has the pink-to-blue gradient, like the Work page and case studies.
- The design system page's type samples are lorem ipsum, so they show the fonts and sizes rather than real copy.
- One heading font variable, `--font-heading` (Oswald), in place of `--font-heading--primary` and
  `--font-heading--secondary`, which had both become Oswald. Nothing on the site looks different.
- Text is now set with twelve text styles named by their job (display, title, heading, subheading, card title,
  number, statement, lead, body, small, eyebrow, label) instead of sizes picked freely, with the rules on the design
  system page. Text that did the same job now matches: the Contact and 404 titles are bold capitals like the other
  big titles, the call to action's title is bold, the "essentials" facts are Oswald (they were in a serif), card
  titles and labels share one size each, lists are the same size as paragraphs, and the hero tagline is the intro
  size.

### Fixed

- The "Case studies" line in the home page's work section had no size (it used a size that didn't exist), so it now
  uses the intro text size.

### Added

- Photoshop and BrowserStack in the "Tools I use" grid (logos from Devicon). The tiles are smaller to fit 18: 9 per
  row on desktop (was 8), 6 on tablets and 3 on phones, so every row is full.
- Design system: a value card, a second work card, and a new "Case study pieces" section with the Visit site / View
  code buttons, the private repo button, tags, hexagon bullets and the next case study buttons.

## [1.1.1] - 2026-10-26

### Added

- Cloudflare hosting: `wrangler.jsonc` tells Cloudflare to upload the built `dist/` folder after `npm run build`,
  with the site's own 404 page for unknown addresses.

## [1.1.0] - 2026-10-26

### Added

- Case studies: a "Next case study" band at the end, with the next case study's name, a "View case study" button
  to it (the last leads back to the first, in the order set in `case-studies.json`, which `npm run new` adds to)
  and an outlined "All work" button back to the Work page. Below it, the "Your brand could be next" prompt to
  Contact (the one the home page used to end with).
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

- The header links: Home, About, Work, Tools, Clients, Process and Contact (plus the GitHub, LinkedIn and Résumé
  links), in the order they come on the site. Work now goes to the Work page, and About, Tools, Clients and Process
  to their sections of the home page from any page (Tools and Work used to point at sections that didn't exist).
  Home is marked on the home page, and Work on the Work page and every case study. Between 1024px and 1280px wide
  the links are a little tighter so they all fit; below 1024px they're in the menu.
- Home page: it now ends with "Like what you see? Let's build something together." and a "Get in touch" button
  (swapped with the case studies' prompt).
- Work page, 02 Custom Coded: the placeholders are now screenshots: the first two are Thunderpick's Live Support Survey
  and Slots.lv's Live Chat Form, and the third MatchPay's Live Chat Window.
- Work page: it now ends with the case studies' "Your brand could be next" prompt to Contact, right against the
  footer (the page's own space at the bottom is gone), with 130px of space below the last row of work.
- Work page, 03 API Components (was 04): the three placeholder widgets are now real screenshots of Slots.lv
  components (VIP Benefits, Hot Drop Jackpots and Refer & Earn) in browser-window frames, like the other sections'
  cards.
- Work page, 04 is now "EDMs & Banners" (was 03 "Custom EDMs"; it swapped places with API Components), with real
  work in place of the four mock emails: banner ads for Kathmandu's Easter Sale and Nissan's Pulsar drive-away
  offer, shown whole, then Kathmandu's camping gear sale email (showing its footwear deals and Summit Club footer),
  inset and zoomed out. Three across like the other rows, with the same browser-window frame, size and outline.
- Home page, Tools I use: each box shows the tool's name under its logo (screen readers still hear each name once).
- Home page, the role cards under My Process: the photo of Gemma shows clean, without the "Agency · Mindset / Hi
  there" words (and the dark fade behind them) over it. Every card now reads from the top, the number first and
  the role right under it, then what it covers, with the tool tag kept at the bottom, so all seven line up the same
  way. The tool tags now read "Jira · kanban board", "Optimizely · A/B Test", "GraphQL · API CMS" and
  "BrowserStack · A11y" (were Notion, Wireframes · personas · insights, API dashboard and Chrome DevTools · Lighthouse).
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
- Work page (/work/): a new black hero: "Featured Projects" left-aligned and stacked, the two words exactly the same
  width at every screen size ("Projects" in a thin gradient weight), with a short introduction to the hand-picked
  case studies, and, beside it, an angled browser window of project screenshots in the style of the home page's "My
  Work" wall, fading into the black. The carousel is gone from the hero (each project now has its own in its case
  study), and the wall of LNDMRK pages and the two LNDMRK bento grids are hidden (their partials are kept, to bring
  back any time). Its nav bar now has the gradient, like the other work pages.

### Fixed

- The cross-fade between pages was sometimes skipped, with a "Transition was aborted ... opt-in disabled" error
  in the console (about one click in three in Chrome): the new page could be ready to show before Chrome had read
  the stylesheet that switched the fade on. It's now switched on in a small style block at the top of every page's
  head, so every click fades. Visitors who prefer reduced motion still get no fade.
- The design system page scrolled sideways on phones: the spacing list's rows were wider than the screen. On phones
  each token's name and size now share a line with its bar underneath.
- The header's links capsule overlapped the logo, icons and Résumé button between about 768px and 1100px wide. Below
  1024px the header now uses the menu button (the full nav doesn't fit), and from 1024px the capsule sits between
  the logo and the icons, centred when there's room, instead of pinned to the middle regardless.
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

- The About page (its placeholder content is covered by the home page's About section).
- The Work page experiments work-v2, work-v3 and work-v4, and the partials and styles only they used. Everything
  they shared with the case studies stays.
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

[Unreleased]: https://github.com/gemmagentles/portfolio-2026/compare/v1.1.1...develop
[1.1.1]: https://github.com/gemmagentles/portfolio-2026/compare/v1.1.0...v1.1.1
[1.1.0]: https://github.com/gemmagentles/portfolio-2026/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/gemmagentles/portfolio-2026/releases/tag/v1.0.0
