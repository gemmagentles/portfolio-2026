// Marks the sticky header once the hero has scrolled out from under it, which shows the gradient bar.
// Pages without a hero show the bar straight away.
export function initHeader() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  const hero = document.querySelector('.hero__wrapper');
  if (!hero) {
    header.classList.add('is-past-hero');
    return;
  }

  const observer = new IntersectionObserver(
    ([entry]) => {
      const pastHero = !entry.isIntersecting && entry.boundingClientRect.top < 0;
      header.classList.toggle('is-past-hero', pastHero);
    },
    // Treat the area behind the header as off-screen, so the bar appears as the hero's bottom passes the header.
    { rootMargin: `-${header.offsetHeight}px 0px 0px 0px` }
  );
  observer.observe(hero);
}
