// "View code" buttons for private repos ([data-private-repo]): clicking one turns it into "Repo private".
// The CSS swaps the label for the message (src/scss/components/_repo-button.scss); this adds .is-private and fills
// a hidden status line so screen readers hear why nothing opened.
export function initPrivateRepo() {
  const buttons = document.querySelectorAll('[data-private-repo]');
  if (!buttons.length) return;

  buttons.forEach((button) => {
    const label = button.querySelector('.repo-button__label');
    const message = button.querySelector('.repo-button__message');

    // The status line exists from the start (empty), so the message is announced when it's filled in.
    const status = document.createElement('span');
    status.className = 'visually-hidden';
    status.setAttribute('role', 'status');
    button.after(status);

    // Until clicked, the hidden message isn't part of the button's name.
    message.setAttribute('aria-hidden', 'true');

    button.addEventListener('click', () => {
      if (button.classList.contains('is-private')) return;

      button.classList.add('is-private');
      button.setAttribute('aria-disabled', 'true');
      label.setAttribute('aria-hidden', 'true');
      message.removeAttribute('aria-hidden');
      status.textContent = 'The code for this project is in a private repository, so it can’t be shared.';
    });
  });
}
