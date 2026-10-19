// Starts the purple paint drips under the hero once the About section is on screen. They run once and stay.
// Visitors who prefer reduced motion see the finished drips straight away (the reduced-motion CSS skips the transition).
export function initDrips() {
  const drips = document.querySelector('[data-drips]');
  if (!drips) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    drips.classList.add('is-dripping');
    return;
  }

  const observer = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      drips.classList.add('is-dripping');
      observer.disconnect();
    }
  }, { threshold: 0.3 });

  observer.observe(drips.parentElement);
}
