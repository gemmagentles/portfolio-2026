// The nav capsule's hover highlight: one pill that glides from link to link as the cursor (or keyboard focus) moves
// along the links, stretching and shrinking to fit each word on the way, then fades out when the cursor leaves.
// Only in the desktop capsule (md up), and not for visitors who prefer reduced motion: they keep the plain hover on
// each link (src/scss/layout/_header.scss).
export function initNavGlide() {
  const list = document.querySelector('.site-nav__list');
  if (!list) return;

  const desktop = window.matchMedia('(min-width: 48em)');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  // The pill itself: an empty list item, hidden from screen readers, positioned under the hovered link.
  const glide = document.createElement('li');
  glide.className = 'site-nav__glide';
  glide.setAttribute('aria-hidden', 'true');
  list.prepend(glide);

  const active = () => desktop.matches && !reduced.matches;

  const moveTo = (link) => {
    if (!active()) return;
    const listBox = list.getBoundingClientRect();
    const box = link.getBoundingClientRect();
    const first = !list.classList.contains('is-gliding');
    // Coming in from outside: jump straight to the link, then fade in, rather than sliding in from the last spot.
    if (first) glide.style.transition = 'none';
    glide.style.width = `${box.width}px`;
    glide.style.transform = `translateX(${box.left - listBox.left}px)`;
    if (first) {
      glide.getBoundingClientRect(); // apply the jump before turning the transition back on
      glide.style.transition = '';
    }
    list.classList.add('is-gliding');
  };

  const hide = () => list.classList.remove('is-gliding');

  list.querySelectorAll('a').forEach((link) => {
    link.addEventListener('pointerenter', () => moveTo(link));
    link.addEventListener('focus', () => {
      if (link.matches(':focus-visible')) moveTo(link);
    });
    link.addEventListener('blur', hide);
  });
  list.addEventListener('pointerleave', hide);

  // Turned on only while it can run, so the plain hover takes over otherwise.
  const toggle = () => list.classList.toggle('has-glide', active());
  toggle();
  desktop.addEventListener('change', toggle);
  reduced.addEventListener('change', toggle);
}
