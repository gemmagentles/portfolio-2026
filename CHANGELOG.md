# Changelog

All notable changes to gemmagentles.dev are written down here, newest first.

The layout follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and version numbers follow
[Semantic Versioning](https://semver.org/): a big redesign bumps the first number (2.0.0), a new page or feature
the middle one (1.1.0), and a fix the last one (1.0.1).

Work merged into `develop` goes under **Unreleased**. When a release goes live, that list moves under its new
version number and date.

## [Unreleased]

### Added

- Gitflow branching rules in `CLAUDE.md`: work happens on `feature/`, `release/` and `hotfix/` branches, never
  straight on `main` or `develop`.
- This changelog, and a rule that it's updated with every merge.
- On hover and keyboard focus, the header's Résumé button turns white with dark text, and its download arrow
  nudges down and settles back like the footer's résumé link (no movement for visitors who prefer reduced motion).
- Work page v4: a "View code" button (outlined) beside "Visit site" in the 50/50 section. It links to the
  project's repo, or, when the repo is private (as for LNDMRK), clicking it makes it try to open (the arrow flies
  up and round twice), then the arrow turns into a padlock and the text changes to "Repo private".

### Changed

- Project notes now record the GitHub repo and drop the finished "delete the backups" to-do.
- The GitHub and LinkedIn links in the header, footer and contact page now go to the real profiles
  (github.com/gemmagentles and ca.linkedin.com/in/gemmagentles) instead of placeholders.
- The favicon is now a square in the pink-to-blue gradient with a white "G" (it was a triangle).
- The logo reads "Gemma Gentles" in title case instead of all capitals (still Oswald).

### Fixed

- The Résumé button in the header is now black on every page (it was white on the work pages and pages with the
  plain black bar). On the black bar it has a faint outline so it still stands out. The phone menu is unchanged.

### Removed

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
