// The Contact page's form (contact/index.html, styles in components/_contact-form.scss). As the visitor types it keeps
// the design's states up to date: which steps are done (their number becomes a tick), which one is current ("In
// progress"), the "N / 4 done" count, the progress bar, the "Still needed" list and whether the button is ready. It also draws the Cloudflare Turnstile check, then sends the form to /api/contact
// (worker/index.js) without leaving the page: "Message sent." on success, the reason under the button if not. Each
// Turnstile token works once, so the check is reset after every attempt. Without JavaScript the form still posts and
// the Worker redirects back with ?status=.
export function initContactForm() {
  const card = document.querySelector('[data-contact-form]');
  if (!card) return;

  const form = card.querySelector('form');
  const steps = [...card.querySelectorAll('[data-step]')];
  const fields = steps.map((step) => step.querySelector('input, textarea'));
  const count = card.querySelector('[data-contact-count]');
  const status = card.querySelector('[data-contact-status]');
  const button = form.querySelector('button[type="submit"]');
  const done = card.querySelector('[data-contact-done]');
  const slot = card.querySelector('[data-turnstile]');
  let widgetId;

  // The states, worked out from which fields are filled in correctly.
  const update = () => {
    const valid = fields.map((field) => field.validity.valid);
    const firstOpen = valid.indexOf(false); // the current step (-1 when all are done)
    const total = valid.filter(Boolean).length;

    steps.forEach((step, index) => {
      step.classList.toggle('is-done', valid[index]);
      step.classList.toggle('is-current', index === firstOpen && index > 0);
    });
    fields.forEach((field, index) => {
      card.querySelector(`[data-need="${field.id}"]`).hidden = valid[index];
    });

    card.style.setProperty('--contact-progress', total);
    count.textContent = `${total} / ${fields.length} done`;
    card.classList.toggle('is-ready', total === fields.length);
  };

  form.addEventListener('input', update);
  update();

  // Draw the Turnstile check once its script (loaded on the page with render=explicit) is ready. The real site key
  // (site.config.json) only works on the live domain, so local testing (npx wrangler dev) uses Cloudflare's public test
  // key instead, which pairs with the test secret in .dev.vars.
  const isLocal = ['localhost', '127.0.0.1'].includes(location.hostname);
  const renderTurnstile = () => {
    widgetId = window.turnstile.render(slot, {
      sitekey: isLocal ? '1x00000000000000000000AA' : slot.dataset.sitekey,
      action: 'contact',
      theme: card.classList.contains('contact-form--dark') ? 'dark' : 'light',
      size: 'flexible',
      appearance: 'interaction-only', // only shown when Cloudflare needs a click; usually invisible
    });
  };
  if (window.turnstile) renderTurnstile();
  else document.getElementById('turnstile-script')?.addEventListener('load', renderTurnstile);

  const showSent = () => {
    card.classList.add('is-sent');
    done.focus();
  };

  // Back from a no-JavaScript submit: show how it went.
  const result = new URLSearchParams(location.search).get('status');
  if (result === 'sent') showSent();
  if (result === 'error') status.textContent = 'Sorry, the message didn’t send. Please try again, or email me directly.';

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    status.textContent = '';

    // Not ready yet: take the visitor to the first field that still needs something.
    const firstInvalid = fields.find((field) => !field.validity.valid);
    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }

    button.setAttribute('aria-busy', 'true');
    try {
      const response = await fetch(form.action, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new FormData(form),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || data.ok !== true) throw new Error(data.error || 'Sorry, the message didn’t send.');
      showSent();
    } catch (error) {
      status.textContent = `${error.message} You can also email me directly.`;
    } finally {
      button.removeAttribute('aria-busy');
      if (widgetId !== undefined) window.turnstile.reset(widgetId);
    }
  });

  // "Send another message": back to an empty form.
  card.querySelector('[data-contact-again]').addEventListener('click', () => {
    form.reset();
    update();
    card.classList.remove('is-sent');
    fields[0].focus();
  });
}
