// Adds .is-visible to [data-reveal] elements as they scroll into view.
// Siblings revealed together get a small stagger. Styles live in src/scss/components/_reveal.scss.
// data-reveal="late" waits until the element's top is about a third of the way up the screen, so more of it is in
// view first (used by the work-v4 50/50 rows, whose animation is meant to play out as you arrive).
export function initReveal() {
  const items = document.querySelectorAll('[data-reveal]');
  if (!items.length) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion || !('IntersectionObserver' in window)) {
    items.forEach((item) => item.classList.add('is-visible'));
    return;
  }

  const watch = (options) => {
    const observer = new IntersectionObserver((entries) => {
      const entering = entries.filter((entry) => entry.isIntersecting);
      entering.forEach((entry, index) => {
        entry.target.style.setProperty('--reveal-delay', `${index * 90}ms`);
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, options);
    return observer;
  };

  const normal = watch({ rootMargin: '0px 0px -10% 0px', threshold: 0.1 });
  const late = watch({ rootMargin: '0px 0px -35% 0px', threshold: 0 });

  items.forEach((item) => (item.dataset.reveal === 'late' ? late : normal).observe(item));
}
