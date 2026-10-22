// One small module per feature. Add new ones in src/js/modules and start them here.
import { initNav } from './modules/nav.js';
import { initNavGlide } from './modules/navglide.js';
import { initReveal } from './modules/reveal.js';
import { initHeader } from './modules/header.js';
import { initProcess } from './modules/process.js';
import { initWorkGrid } from './modules/workgrid.js';
// import { initWave } from './modules/wave.js'; // curved, animated edges between sections: switched off
import { initYears } from './modules/years.js';
import { initShowcase } from './modules/showcase.js';
import { initPrivateRepo } from './modules/private-repo.js';
import { initPageNav } from './modules/page-nav.js';

initNav();
initNavGlide();
initReveal();
initHeader();
initProcess();
initWorkGrid();
// initWave();
initYears();
initShowcase();
initPrivateRepo();
initPageNav();
