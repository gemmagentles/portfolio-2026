// Mobile menu: toggles the nav, closes on Escape, on link click, and when clicking outside.
export function initNav() {
  const toggle = document.querySelector('[data-nav-toggle]');
  const nav = toggle && document.getElementById(toggle.getAttribute('aria-controls'));
  if (!toggle || !nav) return;

  const setOpen = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
  };

  toggle.addEventListener('click', () => {
    setOpen(toggle.getAttribute('aria-expanded') !== 'true');
  });

  nav.addEventListener('click', (event) => {
    if (event.target.closest('a')) setOpen(false);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && nav.classList.contains('is-open')) {
      setOpen(false);
      toggle.focus();
    }
  });

  document.addEventListener('click', (event) => {
    if (!nav.contains(event.target) && !toggle.contains(event.target)) setOpen(false);
  });
}
