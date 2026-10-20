# gemmagentles.dev

Hand-coded portfolio in HTML, SCSS and vanilla JavaScript. [Vite](https://vite.dev) only does the chores: it compiles SCSS, reloads the browser when you save, stitches in shared partials, and minifies everything for launch.

## Getting started

You need **Node.js 20.19 or newer** (`node -v` to check; get it from nodejs.org).

Open this folder in VS Code, then in the terminal (**Terminal → New Terminal**):

```bash
npm install      # once
npm run dev      # starts the site at http://localhost:5173 and reloads as you edit
```

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Local dev server with live reload |
| `npm run build` | Production build into `dist/` (this is the folder you deploy) |
| `npm run preview` | Serves the built `dist/` so you can check it before deploying |
| `npm run new -- "Project Name"` | Creates a new case study page and placeholder images |
| `npm run test:include` | Tests the partials plugin |

## Where things live

```
index.html                 Home page
about/index.html           About page         → gemmagentles.dev/about/
contact/index.html         Contact page       → gemmagentles.dev/contact/
work/<project>/index.html  Case studies       → gemmagentles.dev/work/<project>/
404.html                   Not-found page

site.config.json           Your name, tagline, email, GitHub, LinkedIn (used on every page)
partials/                  Shared HTML: head, header, footer, project card
templates/case-study.html  The template `npm run new` copies (the work-v4 layout)

src/scss/
  abstracts/               Sass-only tools: breakpoints, mixins (no CSS output)
  base/                    CSS variables (_root.scss), reset, typography, motion
  layout/                  Container, header, footer
  components/              Buttons, project cards, scroll reveal, skip link
  pages/                   Styles for one page each
  main.scss                Imports everything; add new partials here

src/js/
  main.js                  Starts each module
  modules/                 One file per feature: nav, navline, reveal, header, process, tools, workgrid, cards, wave

public/                    Copied as-is: images, favicon, robots.txt, sitemap.xml, resume.pdf
plugins/html-include.js    The small plugin that powers partials (no extra dependencies)
```

## Partials and variables

Any page can pull in a partial:

```html
<include src="footer.html"></include>
<include src="project-card.html" slug="lndmrk" name="LNDMRK" summary="..."></include>
```

Attributes become variables inside the partial (`{{name}}`, `{{summary}}`). Everything in `site.config.json` works anywhere as `{{site.name}}`, `{{site.email}}` and so on, and `{{year}}` is the current year.

Nav links written as `<a href="/about/" data-nav="/about/">` get `aria-current` automatically on the matching page, which the CSS uses to underline the current link.

## Changing the look

- **Colours, fonts, spacing, type sizes:** the custom properties in `src/scss/base/_root.scss`.
- **Fonts:** swap the Google Fonts link in `partials/head.html` and update `--font-display` / `--font-body`. Before launch, consider self-hosting the fonts (download the `.woff2` files into `public/fonts/` and add `@font-face` rules) for speed and privacy.
- **Breakpoints:** `src/scss/abstracts/_variables.scss`. Use them with `@include mq(md) { ... }`.

## Adding a project

```bash
npm run new -- "Project Name"
```

This creates `work/project-name/index.html` in the work-v4 layout (a carousel of the project's pages, then 50/50 rows of text and pictures, ending with "Visit site" and "View code") plus placeholder images. The carousel screens, pictures and buttons are shared partials, so their look stays the same on every case study. Then:

1. Add a card for it in `index.html` (the command prints the line to paste).
2. Write the case study text: replace everything in [square brackets], and the live site address (`https://example.com`). If the code is in a repo you can link to, swap `view-code-private.html` for `view-code.html` with `repo="..."`.
3. Replace the placeholder images in `public/images/work/project-name/` with real screenshots as `.webp`: full-length pages captured 1440 wide (`home-full`, `about-full`, `contact-full`), a phone screenshot 780 wide (`mobile`), an iPad one at 2360×1640 (`tablet`), a 1600×1000 screenshot, a devices mockup (`devices`) and a 1600×1000 `cover` for the home page card. Then update the `image` (and `width`/`height`) on each include in the page, and on the home page card.
4. Add the page to `public/sitemap.xml`.

## Before launch checklist

- [ ] Real GitHub and LinkedIn links in `site.config.json`
- [ ] Your real email in `site.config.json`
- [ ] `public/resume.pdf` added (the links point to it)
- [ ] `public/images/og-image.png` (1200×630) for link previews on LinkedIn and Slack
- [ ] "Visit live site" links on each case study point to the client URLs
- [ ] Run `npm run build && npm run preview`, then run Lighthouse in Chrome DevTools on each page (aim for 95+)
- [ ] Tab through every page with the keyboard only
- [ ] Years of experience in the HTML for search engines: work it out at build time (start year 2012 in `site.config.json`, filled in by the include plugin like `{{year}}`), and add a GitHub Action that triggers your host's deploy hook every 1 January so the number goes up. The page currently has a fixed 14 that `src/js/modules/years.js` updates in the browser.

## Deploying

Any static host works. With Netlify, Vercel or Cloudflare Pages: connect the GitHub repo, set the build command to `npm run build` and the output folder to `dist`, then add `gemmagentles.dev` as the custom domain.
