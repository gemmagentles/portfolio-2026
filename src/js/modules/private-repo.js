// "View code" buttons for private repos ([data-private-repo]): clicking one makes it try to open (.is-working: the
// arrow pushes up and back), then turns it into "Repo private" (.is-private), starting the SVG animations that
// reshape the arrow's lines into a padlock. Styles: src/scss/components/_repo-button.scss.
//
// It also sizes the button: the button is fixed at its "Repo private" width so nothing around it moves, while the
// text's box starts at the width of "View code" and eases to the width of "Repo private". A hidden status line
// tells screen readers why nothing opened.
export function initPrivateRepo() {
  const buttons = document.querySelectorAll('[data-private-repo]');
  if (!buttons.length) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  buttons.forEach((button) => {
    const text = button.querySelector('.repo-button__text');
    const label = button.querySelector('.repo-button__label');
    const message = button.querySelector('.repo-button__message');
    const icon = button.querySelector('.repo-button__icon');
    const morphs = button.querySelectorAll('animate');

    // The status line exists from the start (empty), so the message is announced when it's filled in.
    const status = document.createElement('span');
    status.className = 'visually-hidden';
    status.setAttribute('role', 'status');
    button.after(status);

    // Until clicked, the hidden message isn't part of the button's name.
    message.setAttribute('aria-hidden', 'true');

    // Measures the two texts (again whenever the font loads or the screen size changes the text size). offsetWidth
    // gives the real size even while the row is mid scroll-in (scaled down), and the extra pixel stops a rounded-down
    // width from clipping the last letter.
    // The text's width transition is switched off meanwhile, so the measuring itself doesn't animate.
    const size = () => {
      text.style.transition = 'none';
      button.style.width = '';
      text.style.width = '';
      const labelWidth = label.offsetWidth + 1;
      const messageWidth = message.offsetWidth + 1;

      text.style.width = `${messageWidth}px`;
      button.style.width = `${button.offsetWidth}px`;
      text.style.width = `${button.classList.contains('is-private') ? messageWidth : labelWidth}px`;
      text.dataset.messageWidth = messageWidth;
      text.offsetWidth; // apply the width before the transition comes back
      text.style.transition = '';
    };

    size();
    document.fonts?.ready.then(size);
    window.addEventListener('resize', size);

    const showPrivate = () => {
      button.classList.remove('is-working');
      button.classList.add('is-private');
      text.style.width = `${text.dataset.messageWidth}px`;
      label.setAttribute('aria-hidden', 'true');
      message.removeAttribute('aria-hidden');
      status.textContent = 'The code for this project is in a private repository, so it can’t be shared.';

      if (reduceMotion) {
        // Jump straight to the padlock: give each line its final shape (the last of its animation's values).
        morphs.forEach((morph) => morph.parentElement.setAttribute('d', morph.getAttribute('values').split(';').pop()));
      } else {
        morphs.forEach((morph) => morph.beginElement());
      }
    };

    button.addEventListener('click', () => {
      if (button.hasAttribute('aria-disabled')) return;
      button.setAttribute('aria-disabled', 'true');

      if (reduceMotion) {
        showPrivate();
        return;
      }

      icon.addEventListener('animationend', showPrivate, { once: true });
      button.classList.add('is-working');
    });
  });
}
