// The Work page carousel: three project screens, one in front and two angled behind it.
// Clicking a screen behind (or the arrows) brings that project to the front; the CSS animates the move
// (src/scss/pages/_work.scss). Clicking the front screen either:
// - drops it and unfolds a drawer underneath with a description of the project (clicking again folds it away), when
//   the carousel has a [data-showcase-drawer] (as on /work/), or
// - scrolls down so the section after the carousel starts at the top of the screen, when the carousel has
//   data-showcase="scroll" (as on work-v4).
// (It doesn't open the case study yet.)
export function initShowcase() {
  const carousel = document.querySelector('[data-showcase]');
  if (!carousel) return;

  const screens = [...carousel.querySelectorAll('[data-pos]')];
  const drawer = carousel.querySelector('[data-showcase-drawer]');
  const details = drawer ? [...drawer.querySelectorAll('[data-details]')] : [];
  const scrollOn = carousel.dataset.showcase === 'scroll';
  const status = carousel.querySelector('[data-showcase-status]');
  const count = screens.length;
  let current = screens.findIndex((screen) => screen.dataset.pos === '0');
  let open = false;

  const setOpen = (state) => {
    if (!drawer) return;
    open = state;
    drawer.classList.toggle('is-open', open);
    screens.forEach((screen, i) => {
      const link = screen.querySelector('a');
      link.setAttribute('aria-expanded', String(open && i === current));
      link.setAttribute('aria-controls', drawer.id);
    });
  };

  // Each screen's place relative to the front one: 0 front, 1 to the right, -1 to the left.
  const show = (index) => {
    if (open) setOpen(false);
    current = (index + count) % count;
    screens.forEach((screen, i) => {
      let pos = (i - current + count) % count;
      if (pos > count / 2) pos -= count;
      screen.dataset.pos = pos;
    });
    details.forEach((detail, i) => (detail.hidden = i !== current));
    const name = screens[current].querySelector('.work-showcase__name').textContent;
    status.textContent = `${name} · ${current + 1} of ${count}`;
  };

  // The drop: removing the class and reading offsetWidth restarts the animation on repeat clicks.
  const drop = (screen) => {
    screen.classList.remove('is-dropping');
    void screen.offsetWidth;
    screen.classList.add('is-dropping');
  };

  // Scrolls so the content of the section after the carousel's own one (its first child: on work-v4, the 50/50
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
    screen.addEventListener('animationend', () => screen.classList.remove('is-dropping'));

    screen.querySelector('a').addEventListener('click', (event) => {
      event.preventDefault();
      if (screen.dataset.pos !== '0') {
        show(i);
      } else if (scrollOn) {
        scrollToNext();
      } else if (!open) {
        drop(screen);
        setOpen(true);
      } else {
        setOpen(false);
      }
    });
  });

  carousel.querySelector('[data-showcase-prev]').addEventListener('click', () => show(current - 1));
  carousel.querySelector('[data-showcase-next]').addEventListener('click', () => show(current + 1));

  setOpen(false);
}
