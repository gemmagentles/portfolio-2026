// "On this page" bar on the home page (partials/page-nav.html, styles in src/scss/components/_page-nav.scss).
// - Shows the bar (.is-visible) once the hero has scrolled away, and hides it again when the hero comes back.
// - Scroll-spy: marks the link to the section you're reading with aria-current="location". A section counts as
//   being read once its top has passed a line a third of the way down the screen (IntersectionObserver), and stays
//   marked until the next one does, so it stays marked in the parts between them (e.g. the Systems section between
//   Tools and Clients).
//   Above the first section nothing is marked.
// The links themselves are plain in-page links: the page's smooth scrolling applies (instant for visitors who
// prefer reduced motion, base/_typography.scss), and they work without this script.
export function initPageNav() {
  const nav = document.querySelector('[data-page-nav]');
  if (!nav) return;

  const list = nav.querySelector('.page-nav__list');
  const links = [...nav.querySelectorAll('a[href^="#"]')];
  const sections = links.map((link) => document.getElementById(link.hash.slice(1)));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  // Showing the bar: when the bottom of the hero has gone above the top of the screen.
  const hero = document.querySelector('.hero__wrapper');
  if (hero) {
    new IntersectionObserver(([entry]) => {
      nav.classList.toggle('is-visible', !entry.isIntersecting && entry.boundingClientRect.top < 0);
    }).observe(hero);
  } else {
    nav.classList.add('is-visible');
  }

  // Marking the current section: the last one whose top has passed the line. The sections the observer has just
  // reported use its own figures (taken as they crossed the line; measuring again afterwards can lag behind during a
  // fast smooth scroll). The rest are measured now, since a jump can carry a section right past the line without
  // the observer reporting it.
  let current = null;

  const mark = (entries = []) => {
    const line = window.innerHeight / 3;
    const reported = new Map(entries.map((entry) => [entry.target, entry]));
    let index = -1;
    sections.forEach((section, i) => {
      if (!section) return;
      const entry = reported.get(section);
      const isPast = entry
        ? entry.isIntersecting || entry.boundingClientRect.top < entry.rootBounds.top
        : section.getBoundingClientRect().top <= line;
      if (isPast) index = i;
    });

    const link = links[index] || null;
    if (link === current) return;
    current = link;
    links.forEach((each) => {
      if (each === link) each.setAttribute('aria-current', 'location');
      else each.removeAttribute('aria-current');
    });

    // On a phone, where the row of links can scroll sideways, bring the marked link into view.
    if (link && list.scrollWidth > list.clientWidth) {
      list.scrollTo({
        left: link.offsetLeft - (list.clientWidth - link.offsetWidth) / 2,
        behavior: reduceMotion.matches ? 'auto' : 'smooth',
      });
    }
  };

  // A thin band at the line, a third of the way down the screen: whenever a section's edge crosses it, the observer
  // reports, and the current section is worked out again. (It also reports every section once at the start.)
  const spy = new IntersectionObserver(mark, { rootMargin: '-33% 0px -66% 0px' });
  sections.forEach((section) => section && spy.observe(section));

  // And once more when scrolling stops, with everything settled.
  window.addEventListener('scrollend', () => mark(), { passive: true });
}
