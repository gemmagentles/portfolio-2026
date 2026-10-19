// The Work page carousel: three project screens, one in front and two angled behind it.
// Clicking a screen behind (or the arrows) brings that project to the front; the CSS animates the move
// (src/scss/pages/_work.scss). Clicking the front screen either:
// - drops it and unfolds a drawer underneath with a description of the project (clicking again folds it away), when
//   the carousel has a [data-showcase-drawer] (as on /work/), or
// - scrolls down to the section after the carousel, when the carousel has data-showcase="scroll" (as on work-v4).
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

  // The section after the carousel's own one (the page's smooth scrolling and header offset apply).
  const scrollToNext = () => {
    const next = carousel.closest('section')?.nextElementSibling;
    if (next) next.scrollIntoView({ block: 'start' });
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
