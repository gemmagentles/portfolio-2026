# gemmagentles.dev

Gemma Gentles' portfolio: hand-coded HTML, SCSS and vanilla JavaScript. [Vite](https://vite.dev) only does the chores: it compiles SCSS, reloads the browser when you save, stitches in shared partials, and minifies everything for launch. The contact form is the only server code: a small Cloudflare Worker.

## How this site is built

A 1½-minute tour of the code: pages and partials, the contact form, hosting on Cloudflare, testing and Gitflow.

https://github.com/user-attachments/assets/7e4c1ca3-d1b4-412f-9495-bdd6fcb6f703


## Getting started

You need:

- **Node.js 20.19 or newer** (`node -v` to check; get it from nodejs.org).
- **Google Chrome**, for the screenshot scripts and the UX tests (they drive it through `puppeteer-core`). They look for it at `C:/Program Files (x86)/Google/Chrome/Application/chrome.exe`; on a Mac, Linux or another install path, set `CHROME_PATH` to Chrome's location first (for example `export CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"`).

Open this folder in VS Code, then in the terminal (**Terminal → New Terminal**):

```bash
npm install      # once
npm run dev      # starts the site at http://localhost:5173 and reloads as you edit
```

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Local dev server with live reload (port 5173). The contact form can't send here: see [Testing the contact form locally](#testing-the-contact-form-locally) |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serves the built `dist/` so you can check it before deploying (port 4173; no contact form either) |
| `npx wrangler dev` | Serves the built site **with** the contact form's Worker, at http://127.0.0.1:8787 (run `npm run build` first) |
| `npx wrangler deploy --dry-run` | Checks the Cloudflare settings (`wrangler.jsonc`) without signing in or deploying |
| `npm run test:include` | Tests the partials plugin (run after changing `plugins/html-include.js`) |
| `npm run test:ux` | Builds the site and checks it like a visitor would, in headless Chrome (`tests/ux/`, about a minute; its README explains each test and how to add one) |
| `npm run new -- "Project Name"` | Creates a new case study page and placeholder images (add the live site's address to capture its pages too) |
| `npm run capture -- slug https://site/` | Screenshots every page of a live site into a case study's carousel, and makes its device pictures and brand board |
| `node scripts/devices-mockup.js slug` | Remakes just a case study's devices picture (iMac, MacBook, iPad, iPhone) from its screenshots |
| `node scripts/workflow-mockup.js` | Remakes the home page's "Responsive, accessible and future-proof." picture (`--keep` reuses the screens already there) |

## Where things live

```
index.html                 Home page (the About, Tools, Clients and Process sections live here)
work/index.html            Work page          → gemmagentles.dev/work/
work/<project>/index.html  Case studies       → gemmagentles.dev/work/<project>/
contact/index.html         Contact page       → gemmagentles.dev/contact/
design-system/index.html   Design system      → gemmagentles.dev/design-system/ (colours, type, buttons, components)
404.html                   Not-found page

site.config.json           Name, tagline, email, GitHub, LinkedIn, Turnstile site key (used on every page)
case-studies.json          The case studies in order (each one's "Next case study" link; the last loops back)
partials/                  Shared HTML: head, header, footer, cards, case study pieces, brand boards
templates/case-study.html  The template `npm run new` copies (every case study's layout)

src/scss/
  abstracts/               Sass-only tools: breakpoints, mixins, text styles (no CSS output)
  base/                    CSS variables (_root.scss), reset, typography, motion
  layout/                  Container, header, footer
  components/              One file per component (buttons, cards, contact form, carousel…)
  pages/                   Styles for one page each
  main.scss                Imports everything; add new partials here

src/js/
  main.js                  Starts each module
  modules/                 One file per feature: header, nav, navglide, reveal, process, workgrid, years,
                           showcase, private-repo, contact-form

worker/index.js            The contact form's server code (a Cloudflare Worker; only /api/* reaches it)
wrangler.jsonc             Cloudflare hosting settings: the built site, the Worker, email sending
public/                    Copied as-is: images, favicons, robots.txt, sitemap.xml
plugins/html-include.js    The small plugin that powers partials (no extra dependencies)
scripts/                   New case study, page capture, brand board and mockup scripts
tests/ux/                  UX tests (npm run test:ux)

CHANGELOG.md               What changed in each release
CLAUDE.md                  Detailed project notes and rules (written for Claude Code, useful for anyone), and the
                           to-do list
```

## Partials and variables

Any page can pull in a partial:

```html
<include src="footer.html"></include>
<include src="work-card-site.html" href="/work/lndmrk/" image="/images/work/lndmrk/cover.webp" name="LNDMRK" type="Website"></include>
```

Attributes become variables inside the partial (`{{name}}`, `{{href}}`). Everything in `site.config.json` works anywhere as `{{site.name}}`, `{{site.email}}` and so on, and `{{year}}` is the current year. Attribute values can't contain `>` or `"`, and an include written inside an HTML comment still runs, so don't write one in a comment.

Nav links written as `<a href="/contact/" data-nav="/contact/">` get `aria-current` automatically on the matching page, which the CSS uses to underline the current link.

## How the contact form works (stopping spam)

The Contact page's form posts to `/api/contact`, the site's only server code (`worker/index.js`, a Cloudflare Worker). Before anything is emailed:

1. **Cloudflare Turnstile checks it isn't a bot.** It runs quietly in the visitor's browser (a checkbox only shows if Cloudflare is unsure). The Worker then asks Cloudflare to confirm the pass is real, used only once, made for this form (its `contact` action) and came from gemmagentles.dev, not a copy of the form on another site. If anything goes wrong while checking (no secret key, a network error, an odd answer), the message is turned away rather than let through. The local test mode (`TURNSTILE_TEST_MODE`) is only set in `.dev.vars`, never on the live site.
2. **The Worker checks every field again.** It doesn't trust the browser: full name, company, a properly shaped email and a message of 20–5,000 characters, each with a length limit. Bots posting straight to `/api/contact` without the page still have to pass both checks.
3. **It can only email Gemma.** The `EMAIL` binding (Cloudflare Email Routing) only sends to a verified destination address, so the form can't be used to send spam to anyone else. That address is the `CONTACT_TO` secret, kept out of this public repo.
4. **What visitors type can't run in the email.** It's escaped before it goes into the email's HTML, and the visitor's address is only used as the Reply-To, never as the sender (which is always hi@gemmagentles.dev).

## Testing the contact form locally

`npm run dev` and `npm run preview` only serve the pages, so the form can't send there. To try it end to end:

1. Create a file called `.dev.vars` in the project folder (it's in `.gitignore`, so it never reaches GitHub) with Cloudflare's public Turnstile test keys:

   ```
   TURNSTILE_SECRET=1x0000000000000000000000000000000AA
   TURNSTILE_HOSTNAMES=example.com,localhost
   TURNSTILE_TEST_MODE=true
   CONTACT_TO=you@example.com
   ```

   With these every bot check passes, and the email is printed in the terminal instead of being sent, so any address works for `CONTACT_TO`. Never put real keys in this file.
2. Run `npm run build`, then `npx wrangler dev`.
3. Open http://127.0.0.1:8787/contact/ (use `127.0.0.1`, not `localhost`). The page swaps in Turnstile's test site key by itself when it's running locally.

## Changing the look

Start from the [design system page](https://gemmagentles.dev/design-system/) (`/design-system/` locally): it shows the colours, text styles, buttons and components the site is built from.

- **Colours, fonts, spacing, type sizes:** the CSS variables in `src/scss/base/_root.scss` (`--ink`, `--paper`, `--primary-color`, `--brand-gradient`, `--space-*`, `--text-*`…). Use them rather than typing hex values.
- **Fonts:** headings and the logo use Oswald (`--font-heading`), body text Inter (`--font-body`), eyebrows and labels Space Mono. They load from Google Fonts in `partials/head.html`; to change one, swap the link there and update the variable.
- **Breakpoints:** `src/scss/abstracts/_variables.scss`. Use them with `@include mq(md) { ... }` (from md up), `mq-down(md)` (below md) or `mq-between(md, lg)`, never hand-typed `@media` widths.

## How to work on it

**Code rules**

- **BEM for every class:** `block`, `block__element`, `block--modifier`, and states as `is-*` / `has-*`. No utility classes, and a new component gets its own classes rather than borrowing another block's.
- **Text is styled by its job:** `@include type(heading)`, `type(lead)`, `type(eyebrow)` and so on (the roles are in `src/scss/abstracts/_type.scss` and on the design system page). Components don't set font sizes, weights or line heights themselves; if nothing fits, add a new role.
- **SCSS partials** start with `@use '../abstracts' as *;` and are imported in `main.scss`. Animation goes inside the `motion-ok` mixin, so visitors who ask for less motion get none.
- **Comments** say what something is and why, in plain words.
- **Check visual changes** at 1440px and 390px wide (and in between when the layout depends on it) before calling them done. When a page gets a behaviour worth keeping, add a UX test for it in `tests/ux/`.

**Git (Gitflow)**

- `main` holds only released code (Cloudflare deploys it); `develop` collects finished work. Nothing is committed straight to either.
- New work goes on a `feature/<short-name>` branch from `develop`, with a commit per change, then merges back into `develop` with `--no-ff`.
- A release is a `release/<version>` branch from `develop`: bump `version` in `package.json`, move the changelog's Unreleased entries under the new version, merge into `main` with `--no-ff`, tag it `v<version>`, and merge back into `develop`. An urgent live fix is a `hotfix/<version>` branch from `main`, merged into both.
- Every merge comes with an entry in `CHANGELOG.md` ([Keep a Changelog](https://keepachangelog.com/en/1.1.0/) layout), in plain words about what changed on the site.

**Adding or upgrading packages**

Check a package before it goes in:

1. **Publisher:** `npm view <package>@<version> maintainers repository.url`.
2. **Known security problems:** `gh api "/advisories?ecosystem=npm&affects=<package>"`, and read the changelog between the current and new version.
3. **Provenance:** check it was built from the project's own repo by its CI, not uploaded by hand (`npm view <package>@<version> dist.attestations`).

Then install it pinned (`npm install --save-exact`) and run `npm audit signatures` and `npm audit`. Leave install scripts switched off unless something needs them, and never run a package with `npx` that isn't installed in the project (it would fetch whatever is newest).

## Adding a project

```bash
npm run new -- "Project Name"
npm run new -- "Project Name" https://www.client-site.com/
```

With the live site's address, it also fills in the "Visit site" links and screenshots every page of the site (the pages linked in its header and menus) into the hero carousel, one screen per page. To re-capture later, for example after the client adds a page: `npm run capture -- project-name https://www.client-site.com/`.

This creates `work/project-name/index.html` in the case study layout (a carousel of the project's pages, then 50/50 rows of text and pictures, ending with "Visit site" and "View code") plus placeholder images. The carousel screens, pictures and buttons are shared partials, so their look stays the same on every case study. Then:

1. Add a card for it in `index.html` (the command prints the line to paste).
2. Write the case study text: replace everything in [square brackets], and the live site address (`https://example.com`). "View code" is set up for you: if the GitHub account has a public repo named after the client (spaces, dashes and capitals ignored), it links there; if not, it shows "Repo private". To change it, swap `view-code-private.html` for `view-code.html` with `repo="..."` (or back).
3. Pictures: with the site's address, the carousel, the iMac, the iPad, the phone, a brand guidelines board (their name, font, colours, logo and favicon) and the last row's devices mockup (the site on an iMac, a MacBook, an iPad and an iPhone) are made for you (in `public/images/work/project-name/pages/`). Replace the rest by hand as `.webp`: a 1600×1000 `cover` for the home page card. Then update the `image` (and `width`/`height`) on each include in the page, and on the home page card. A picture you set by hand is never overwritten by a re-capture.
4. Add the page to `public/sitemap.xml`. (It's added to the end of `case-studies.json` for you, so the "Next case study" links run through it; reorder that file to change the order.)

## Deploying

The site is hosted on **Cloudflare Workers** (static assets plus the contact form's Worker), connected to the GitHub repo. A push to `main` deploys it: Cloudflare runs `npm run build`, then `npx wrangler deploy`, which reads `wrangler.jsonc`. A plain static host (Netlify, Vercel, GitHub Pages) would serve the pages but not the contact form.

Setting it up on a new Cloudflare account (once):

1. **Workers & Pages → Create → Import a repository:** pick this repo, build command `npm run build`, deploy command `npx wrangler deploy`. The Worker's name must match `name` in `wrangler.jsonc`.
2. **Email Routing** on for the domain (Email → Email Routing), with the inbox that should receive messages added and verified under Destination addresses.
3. **Turnstile:** add a widget for the domain, and put its site key in `site.config.json` as `turnstileSitekey`.
4. **Secrets** (never in the code), from the project folder:

   ```bash
   npx wrangler secret put TURNSTILE_SECRET   # the Turnstile widget's secret key
   npx wrangler secret put CONTACT_TO         # the verified inbox the messages go to
   ```

5. Add the custom domain to the Worker (Settings → Domains & Routes), and check `TURNSTILE_HOSTNAMES` and `CONTACT_FROM` in `wrangler.jsonc` match it.
