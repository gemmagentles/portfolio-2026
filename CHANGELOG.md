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

### Changed

- Project notes now record the GitHub repo and drop the finished "delete the backups" to-do.

### Removed

- The old `.bak` backup files and `src-scss-before-tokens.bak.tar` (Git history replaces them).

## [1.0.0] - 2026-10-19

### Added

- First commit of the hand-coded portfolio: home, about, contact, work and the LNDMRK, Fraser Valley and Nueva
  Gold case studies, the design system page and the Work page experiments (v2, v3, v4).
- HTML partials plugin with tests, SCSS design tokens, and vanilla JS modules on a small Vite starter.
- `.gitignore` and `.gitattributes` (Unix line endings), published to GitHub as a public repo.

[Unreleased]: https://github.com/gemmagentles/portfolio-2026/compare/v1.0.0...develop
[1.0.0]: https://github.com/gemmagentles/portfolio-2026/releases/tag/v1.0.0
