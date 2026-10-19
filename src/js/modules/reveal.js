// Adds .is-visible to [data-reveal] elements as they scroll into view.
// Siblings revealed together get a small stagger. Styles live in src/scss/components/_reveal.scss.
export function initReveal() {
  const items = document.querySelectorAll('[data-reveal]');
  if (!items.length) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion || !('IntersectionObserver' in window)) {
    items.forEach((item) => item.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      const entering = entries.filter((entry) => entry.isIntersecting);
      entering.forEach((entry, index) => {
        entry.target.style.setProperty('--reveal-delay', `${index * 90}ms`);
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: '0px 0px -10% 0px', threshold: 0.1 },
  );

  items.forEach((item) => observer.observe(item));
}
