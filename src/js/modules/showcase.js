// The carousel of a site's pages at the top of a case study: one screen in front, the rest angled
// behind it. Clicking a screen behind (or the arrows) brings that page to the front; the CSS animates the move
// (src/scss/pages/_work.scss). Clicking the front screen scrolls down so the section after the carousel starts at
// the top of the screen, when the carousel has data-showcase="scroll" (otherwise its link is followed as normal).
// Only one carousel per page (the first is used).
export function initShowcase() {
  const carousel = document.querySelector('[data-showcase]');
  if (!carousel) return;

  const screens = [...carousel.querySelectorAll('[data-pos]')];
  const scrollOn = carousel.dataset.showcase === 'scroll';
  const status = carousel.querySelector('[data-showcase-status]');
  const count = screens.length;
  let current = screens.findIndex((screen) => screen.dataset.pos === '0');

  // Each screen's place relative to the front one: 0 front, 1 to the right, -1 to the left.
  const show = (index) => {
    current = (index + count) % count;
    screens.forEach((screen, i) => {
      let pos = (i - current + count) % count;
      if (pos > count / 2) pos -= count;
      screen.dataset.pos = pos;
    });
    const name = screens[current].querySelector('.work-showcase__name').textContent;
    status.textContent = `${name} · ${current + 1} of ${count}`;
  };

  // Scrolls so the content of the section after the carousel's own one (its first child: on a case study, the 50/50
  // section's rows, past its top padding) sits at the very top of the screen. A gentle ease in and out that takes
  // longer the further it goes (rather than the browser's quicker smooth scroll); scrolling or touching the page
  // meanwhile stops it, so it never fights the visitor. Without motion it jumps straight there.
  const scrollToNext = () => {
    const next = carousel.closest('section')?.nextElementSibling;
    const target = next?.firstElementChild || next;
    if (!target) return;

    const from = window.scrollY;
    const to = Math.min(target.getBoundingClientRect().top + from, document.documentElement.scrollHeight - window.innerHeight);
    const distance = to - from;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      window.scrollTo({ top: to, behavior: 'instant' });
      return;
    }

    const duration = Math.min(1600, Math.max(900, Math.abs(distance) * 1.2));
    const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2); // ease in and out
    const start = performance.now();
    let stopped = false;

    const stop = () => {
      stopped = true;
    };
    const stopEvents = ['wheel', 'touchstart', 'keydown', 'mousedown'];
    stopEvents.forEach((type) => window.addEventListener(type, stop, { once: true, passive: true }));

    const step = (now) => {
      const progress = Math.min(1, (now - start) / duration);
      if (!stopped) window.scrollTo({ top: from + distance * ease(progress), behavior: 'instant' });
      if (progress < 1 && !stopped) {
        requestAnimationFrame(step);
      } else {
        stopEvents.forEach((type) => window.removeEventListener(type, stop));
      }
    };
    requestAnimationFrame(step);
  };

  screens.forEach((screen, i) => {
    screen.querySelector('a').addEventListener('click', (event) => {
      if (screen.dataset.pos !== '0') {
        event.preventDefault();
        show(i);
      } else if (scrollOn) {
        event.preventDefault();
        scrollToNext();
      }
    });
  });

  carousel.querySelector('[data-showcase-prev]').addEventListener('click', () => show(current - 1));
  carousel.querySelector('[data-showcase-next]').addEventListener('click', () => show(current + 1));
}
