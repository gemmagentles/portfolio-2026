// A tiny, dependency-free Vite plugin that lets you write plain HTML with reusable partials.
//
//   <include src="header.html"></include>
//   <include src="head.html" title="About" description="A bit about me"></include>
//
// - `src` is relative to the partials folder. Partials can include other partials.
// - Any other attribute becomes a variable inside that partial: {{title}}, {{description}}.
// - Everything in site.config.json is available everywhere as {{site.name}}, {{site.email}}, etc.
// - {{year}} is always the current year.
// - Nav links written as <a href="/about/" data-nav="/about/"> get aria-current set automatically
//   when you're on that page (or inside that section).

import fs from 'node:fs';
import path from 'node:path';

const INCLUDE_RE = /<include\s+src="([^"]+)"([^>]*)>\s*<\/include>/g;
const ATTR_RE = /([\w-]+)="([^"]*)"/g;
const VAR_RE = /\{\{\s*([\w.-]+)\s*\}\}/g;
const NAV_RE = /<a href="([^"]*)" data-nav="([^"]*)">/g;
const MAX_DEPTH = 10;

// Folders that never contain pages to build.
const IGNORE = new Set(['node_modules', 'dist', 'partials', 'templates', 'public', 'src', 'plugins', 'scripts']);

export function fillVars(html, vars) {
  return html.replace(VAR_RE, (match, key) => (key in vars ? String(vars[key]) : match));
}

export function renderIncludes(html, partialsDir, vars = {}, depth = 0, from = 'page') {
  if (depth > MAX_DEPTH) {
    throw new Error(`[html-include] Includes nested more than ${MAX_DEPTH} deep. Is a partial including itself? (last: ${from})`);
  }
  return html.replace(INCLUDE_RE, (_match, src, attrString) => {
    const file = path.resolve(partialsDir, src);
    if (!fs.existsSync(file)) {
      throw new Error(`[html-include] Partial not found: "${src}" (included from ${from}). Looked in ${partialsDir}`);
    }
    const localVars = { ...vars };
    for (const [, key, value] of attrString.matchAll(ATTR_RE)) localVars[key] = value;

    const content = fs.readFileSync(file, 'utf8');
    const nested = renderIncludes(content, partialsDir, localVars, depth + 1, src);
    return fillVars(nested, localVars);
  });
}

export function markCurrentNav(html, currentUrl) {
  return html.replace(NAV_RE, (_match, href, section) => {
    if (href === currentUrl) return `<a href="${href}" aria-current="page">`;
    // "/" is the home page only: every address starts with "/", so as a section it would mark Home on every page.
    if (section && section !== '/' && currentUrl.startsWith(section)) return `<a href="${href}" aria-current="true">`;
    return `<a href="${href}">`;
  });
}

// "/about/index.html" -> "/about/", "/index.html" -> "/"
export function pageUrl(requestPath) {
  const clean = requestPath.split('?')[0].replace(/\\/g, '/');
  return clean.replace(/index\.html$/, '');
}

export function loadGlobals(configFile) {
  const globals = { year: new Date().getFullYear() };
  if (configFile && fs.existsSync(configFile)) {
    const site = JSON.parse(fs.readFileSync(configFile, 'utf8'));
    for (const [key, value] of Object.entries(site)) globals[`site.${key}`] = value;
  }
  return globals;
}

// Every .html file outside the ignored folders becomes a page in the build.
export function findPages(root, dir = root, pages = {}) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.') || IGNORE.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      findPages(root, full, pages);
    } else if (entry.name.endsWith('.html')) {
      const key = path.relative(root, full).replace(/\\/g, '/').replace(/\.html$/, '');
      pages[key] = full;
    }
  }
  return pages;
}

export function htmlInclude({ partialsDir, configFile }) {
  const normalizedPartials = path.normalize(partialsDir) + path.sep;
  const normalizedConfig = configFile ? path.normalize(configFile) : null;

  return {
    name: 'html-include',
    transformIndexHtml: {
      order: 'pre',
      handler(html, ctx) {
        const globals = loadGlobals(configFile);
        let out = renderIncludes(html, partialsDir, globals, 0, ctx.path);
        out = fillVars(out, globals);
        out = markCurrentNav(out, pageUrl(ctx.path));
        return out;
      },
    },
    // Editing a partial or the site config reloads the browser.
    handleHotUpdate({ file, server }) {
      const changed = path.normalize(file);
      if (changed.startsWith(normalizedPartials) || changed === normalizedConfig) {
        server.ws.send({ type: 'full-reload' });
        return [];
      }
    },
  };
}
