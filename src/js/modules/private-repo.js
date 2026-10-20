// "View code" buttons for private repos ([data-private-repo]): clicking one makes it try to open (.is-working: the
// arrow flies up and round), then turns it into "Repo private" (.is-private: the arrow becomes a padlock).
// The animation lives in src/scss/components/_repo-button.scss; this switches the classes and fills a hidden status
// line so screen readers hear why nothing opened.
export function initPrivateRepo() {
  const buttons = document.querySelectorAll('[data-private-repo]');
  if (!buttons.length) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  buttons.forEach((button) => {
    const label = button.querySelector('.repo-button__label');
    const message = button.querySelector('.repo-button__message');
    const arrow = button.querySelector('.repo-button__arrow');
    const lock = button.querySelector('.repo-button__lock');

    // The status line exists from the start (empty), so the message is announced when it's filled in.
    const status = document.createElement('span');
    status.className = 'visually-hidden';
    status.setAttribute('role', 'status');
    button.after(status);

    // Until clicked, the hidden message isn't part of the button's name.
    message.setAttribute('aria-hidden', 'true');

    const showPrivate = () => {
      button.classList.remove('is-working');
      button.classList.add('is-private');
      label.setAttribute('aria-hidden', 'true');
      message.removeAttribute('aria-hidden');
      status.textContent = 'The code for this project is in a private repository, so it can’t be shared.';
    };

    button.addEventListener('click', () => {
      if (button.hasAttribute('aria-disabled')) return;
      button.setAttribute('aria-disabled', 'true');

      // Without motion there's nothing to wait for. Otherwise wait until the arrow has finished its tries.
      if (reduceMotion) {
        showPrivate();
        return;
      }

      // The padlock sits a little to the right of the arrow (each face is centred), so it starts where the arrow is.
      const arrowBox = arrow.parentElement.getBoundingClientRect();
      const lockBox = lock.getBoundingClientRect();
      lock.style.setProperty('--lock-from', `${arrowBox.left - lockBox.left}px`);

      arrow.addEventListener('animationend', showPrivate, { once: true });
      button.classList.add('is-working');
    });
  });
}
