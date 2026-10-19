// Steps the "My process" bar through each stage, then starts over. Only runs while the section is on screen.
// Visitors who prefer reduced motion see the whole bar filled instead.
export function initProcess() {
  const list = document.querySelector('[data-process]');
  if (!list) return;

  const steps = [...list.children];
  const last = steps.length - 1;
  list.style.setProperty('--count', steps.length);
  const stepTime = 1400; // ms on each stage
  const holdTime = 2400; // ms to pause on the finished bar before starting again

  const show = (current) => {
    list.style.setProperty('--progress', last ? current / last : 1);
    steps.forEach((step, i) => {
      step.classList.toggle('is-done', i < current);
      step.classList.toggle('is-active', i === current);
    });
  };

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    show(last);
    return;
  }

  let current = 0;
  let timer;

  const tick = () => {
    show(current);
    const wait = current === last ? holdTime : stepTime;
    current = current === last ? 0 : current + 1;
    timer = setTimeout(tick, wait);
  };

  new IntersectionObserver(([entry]) => {
    clearTimeout(timer);
    if (entry.isIntersecting) tick();
  }, { threshold: 0.4 }).observe(list);
}
