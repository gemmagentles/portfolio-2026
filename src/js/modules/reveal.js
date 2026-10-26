// Adds .is-visible to [data-reveal] elements as they scroll into view. Styles live in src/scss/components/_reveal.scss.
//
// An element is revealed once its top passes a line on the screen: 90% of the way down for most things, or 65% for
// data-reveal="late" (the case studies' 50/50 rows, whose animation is meant to play out as you arrive). Anything already
// above its line is revealed too, so content scrolled past quickly (a fast flick, the End key, reloading halfway
// down) never stays hidden. Elements revealed together get a small stagger.
export function initReveal() {
  const items = [...document.querySelectorAll('[data-reveal]')];
  if (!items.length) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) {
    items.forEach((item) => item.classList.add('is-visible'));
    return;
  }

  const pending = new Set(items);
  let queued = false;

  const check = () => {
    queued = false;
    let index = 0;
    pending.forEach((item) => {
      const line = window.innerHeight * (item.dataset.reveal === 'late' ? 0.65 : 0.9);
      if (item.getBoundingClientRect().top > line) return;
      item.style.setProperty('--reveal-delay', `${index++ * 90}ms`);
      item.classList.add('is-visible');
      pending.delete(item);
    });

    if (!pending.size) {
      window.removeEventListener('scroll', queue);
      window.removeEventListener('resize', queue);
    }
  };

  // At most one check per frame, however fast the scroll events come.
  const queue = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(check);
  };

  window.addEventListener('scroll', queue, { passive: true });
  window.addEventListener('resize', queue, { passive: true });
  check();
}
