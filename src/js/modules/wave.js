// Curved edges between sections that sway sideways and flatten to a straight line as you scroll.
//
// - The hero's curve (an SVG already in index.html) is curved at the top of the page and straight once you've
//   scrolled 60% of the hero.
// - Every other section in <main> gets one added here, along its bottom edge and filled with the next section's
//   background colour, so it looks like the next section rising into this one. Each is curved as it comes up from
//   the bottom of the screen and straight by the time it's 40% of the way up. The last section gets none: its
//   edge into the footer stays straight.
//
// Scrolling back brings the curves back. Visitors who prefer reduced motion keep plain straight edges.

const width = 1440; // SVG viewBox width
const height = 80; // SVG viewBox height
const amplitude = 56; // curve depth (viewBox units, out of 80)
const waves = 0.5; // crests across the screen: 0.5 is one sweeping curve, 3 would be three waves
const ripple = 0.5; // how many wavelengths it sways sideways while flattening
const sectionPeak = 0.5; // where each section's curve rises highest, as a share of the width (0.5 = the middle)
const heroPeak = 0.7; // the hero's curve rises highest further right
const steps = 72; // points along the curve

// Draws the filled shape for a given progress (0 = full curve, 1 = flat), with its highest point at 'peak'
// (a share of the width). The curve sits on the bottom edge, so as it flattens it settles exactly onto the
// boundary between the sections.
const shape = (progress, peak, crests = waves) => {
  const amp = amplitude * (1 - progress);
  // The sine term is lowest (so the curve is highest) at 1.5π; shift it so that lands at the peak position.
  const start = Math.PI * 1.5 - peak * crests * Math.PI * 2;
  const phase = start + progress * ripple * Math.PI * 2;
  let d = `M0 ${height}`;
  for (let i = 0; i <= steps; i++) {
    const x = (i / steps) * width;
    const y = height - (amp * (1 - Math.sin((x / width) * crests * Math.PI * 2 + phase))) / 2;
    d += ` L${x.toFixed(1)} ${y.toFixed(2)}`;
  }
  return `${d} L${width} ${height} Z`;
};

const clamp = (value) => Math.min(Math.max(value, 0), 1);

// The colour a section's curve should be: the background of the section that comes next. The last section has none,
// so it gets no curve and its edge into the footer stays straight.
const nextBackground = (section) => {
  const next = section.nextElementSibling;
  return next ? getComputedStyle(next).backgroundColor : '';
};

const isTransparent = (colour) => !colour || colour === 'transparent' || colour === 'rgba(0, 0, 0, 0)';

export function initWave() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const curves = []; // { path, progress() }

  // The hero: progress follows how far the page has scrolled through it.
  const heroPath = document.querySelector('[data-hero-wave]');
  const hero = heroPath && heroPath.closest('.hero__wrapper');
  if (hero) {
    curves.push({ path: heroPath, peak: heroPeak, progress: () => window.scrollY / (hero.offsetHeight * 0.6) });
  }

  // Every other section: progress follows where its bottom edge sits on screen.
  document.querySelectorAll('main > section').forEach((section) => {
    if (section === hero || section.dataset.wave === 'none') return; // data-wave="none": no curve, a straight edge

    const colour = nextBackground(section);
    if (isTransparent(colour) || colour === getComputedStyle(section).backgroundColor) return;

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'section-wave');
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.setAttribute('preserveAspectRatio', 'none');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    svg.style.fill = colour;
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    svg.append(path);
    section.classList.add('has-wave');
    section.append(svg);

    // A section can shape its own curve: data-wave-crests (how many waves across, like "waves" above) and
    // data-wave-peak (where the first crest is highest, as a share of the width).
    curves.push({
      path,
      peak: Number(section.dataset.wavePeak) || sectionPeak,
      crests: Number(section.dataset.waveCrests) || waves,
      progress: () => {
        const edge = section.getBoundingClientRect().bottom;
        return (window.innerHeight - edge) / (window.innerHeight * 0.6);
      },
    });
  });

  if (!curves.length) return;

  let queued = false;
  const update = () => {
    curves.forEach(({ path, peak, crests, progress }) => path.setAttribute('d', shape(clamp(progress()), peak, crests)));
    queued = false;
  };
  const queue = () => {
    if (!queued) {
      queued = true;
      requestAnimationFrame(update);
    }
  };

  window.addEventListener('scroll', queue, { passive: true });
  window.addEventListener('resize', queue);
  update();
}
