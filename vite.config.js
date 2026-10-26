import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { htmlInclude, findPages } from './plugins/html-include.js';

const root = fileURLToPath(new URL('.', import.meta.url));

// Open the dev server in Chrome (set BROWSER yourself to override, or BROWSER=none to disable).
process.env.BROWSER ??= process.platform === 'darwin' ? 'google chrome' : 'chrome';

export default defineConfig({
  plugins: [
    htmlInclude({
      partialsDir: resolve(root, 'partials'),
      configFile: resolve(root, 'site.config.json'),
      caseStudiesFile: resolve(root, 'case-studies.json'), // their order, for each one's "Next case study" link
    }),
  ],
  server: {
    open: true,
  },
  css: {
    devSourcemap: true,
  },
  build: {
    // Every .html page in the project is built automatically (see plugins/html-include.js).
    rollupOptions: {
      input: findPages(root),
    },
  },
});
