// One small module per feature. Add new ones in src/js/modules and start them here.
import { initNav } from './modules/nav.js';
import { initNavGlide } from './modules/navglide.js';
import { initReveal } from './modules/reveal.js';
import { initHeader } from './modules/header.js';
import { initProcess } from './modules/process.js';
import { initWorkGrid } from './modules/workgrid.js';
import { initYears } from './modules/years.js';
import { initShowcase } from './modules/showcase.js';
import { initPrivateRepo } from './modules/private-repo.js';

initNav();
initNavGlide();
initReveal();
initHeader();
initProcess();
initWorkGrid();
initYears();
initShowcase();
initPrivateRepo();
