// The site's only server code: the contact form's handler. Cloudflare serves the built site (dist/) straight from its
// static assets; requests to /api/* come here first (run_worker_first in wrangler.jsonc).
//
// POST /api/contact (from the Contact page's form, src/js/modules/contact-form.js):
// 1. checks the fields (full name, company, work email, message),
// 2. checks the Cloudflare Turnstile token with siteverify, so bots can't send it,
// 3. emails the message to Gemma through Cloudflare (free via Email Routing: the EMAIL binding can only send to her own
//    verified address), with the visitor's address as Reply-To so a reply goes straight to them.
// Answers with JSON ({ ok: true } or { ok: false, error }) for the page's script, or, if the form was sent without
// JavaScript, redirects back to the Contact page with ?status=sent or ?status=error.
//
// Settings (wrangler.jsonc vars, secrets and .dev.vars locally):
// - TURNSTILE_SECRET: the Turnstile widget's secret key (a secret, never in the code)
// - CONTACT_TO: where messages go, a verified Email Routing destination address (a secret, so it stays private)
// - TURNSTILE_HOSTNAMES: the site hostnames a token may come from, comma separated
// - CONTACT_FROM: the sender address on the email (any address on gemmagentles.dev)

const SITEVERIFY = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
const TURNSTILE_ACTION = 'contact';
const LIMITS = { name: 100, company: 100, email: 254, message: 5000 };
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/contact') {
      if (request.method !== 'POST') {
        return new Response('Method not allowed', { status: 405, headers: { Allow: 'POST' } });
      }
      return handleContact(request, env);
    }

    // Anything else under /api/ doesn't exist; everything else is the static site.
    if (url.pathname.startsWith('/api/')) return env.ASSETS.fetch(new Request(new URL('/404.html', url), request));
    return env.ASSETS.fetch(request);
  },
};

async function handleContact(request, env) {
  const wantsJson = (request.headers.get('Accept') || '').includes('application/json');
  const reply = (ok, status, error) =>
    wantsJson
      ? Response.json(ok ? { ok: true } : { ok: false, error }, { status })
      : Response.redirect(new URL(`/contact/?status=${ok ? 'sent' : 'error'}#contact-form`, request.url), 303);

  let form;
  try {
    form = await request.formData();
  } catch {
    return reply(false, 400, 'Please fill in the form and try again.');
  }

  const field = (key) => (typeof form.get(key) === 'string' ? form.get(key).trim() : '');
  const name = field('name');
  const company = field('company');
  const email = field('email');
  const message = field('message');

  if (!name || name.length > LIMITS.name) return reply(false, 400, 'Please add your full name.');
  if (!company || company.length > LIMITS.company) return reply(false, 400, 'Please add your company name.');
  if (!EMAIL_PATTERN.test(email) || email.length > LIMITS.email) {
    return reply(false, 400, 'Please add a valid work email.');
  }
  if (message.length < 20 || message.length > LIMITS.message) {
    return reply(false, 400, 'Please write a message (at least 20 characters).');
  }

  if (!(await turnstilePassed(form.get('cf-turnstile-response'), request, env))) {
    return reply(false, 403, "We couldn't confirm you're not a bot. Please try again.");
  }

  try {
    if (!env.CONTACT_TO) throw Object.assign(new Error('CONTACT_TO is not set'), { code: 'NO_DESTINATION' });
    await env.EMAIL.send({
      to: env.CONTACT_TO,
      from: { email: env.CONTACT_FROM, name: 'Portfolio contact form' },
      replyTo: { email, name },
      subject: `New message from ${name}, ${company} (gemmagentles.dev)`,
      text: `Name: ${name}\nCompany: ${company}\nEmail: ${email}\n\n${message}\n`,
      html: `<p><strong>Name:</strong> ${escapeHtml(name)}<br><strong>Company:</strong> ${escapeHtml(company)}`
        + `<br><strong>Email:</strong> ${escapeHtml(email)}</p>`
        + `<p style="white-space:pre-wrap">${escapeHtml(message)}</p>`,
    });
  } catch (error) {
    console.error('Contact form email failed', error?.code, error?.message);
    return reply(false, 502, 'Sorry, the message didn’t send.');
  }

  return reply(true, 200);
}

// Siteverify: the token must be real, unused, for this form (action) and from this site (hostname). Fails closed:
// anything unexpected (no secret set, network error, bad answer) counts as not passed.
async function turnstilePassed(token, request, env) {
  const hostnames = new Set(
    (env.TURNSTILE_HOSTNAMES || '').split(',').map((hostname) => hostname.trim()).filter(Boolean),
  );
  if (typeof token !== 'string' || !token || token.length > 2048 || !env.TURNSTILE_SECRET || hostnames.size === 0) {
    return false;
  }

  try {
    const response = await fetch(SITEVERIFY, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      signal: AbortSignal.timeout(10_000),
      body: new URLSearchParams({
        secret: env.TURNSTILE_SECRET,
        response: token,
        remoteip: request.headers.get('CF-Connecting-IP') || '',
      }),
    });
    if (!response.ok) return false;
    const result = await response.json();
    // Cloudflare's public test keys answer without an action, so local testing (TURNSTILE_TEST_MODE in .dev.vars,
    // never set on the live site) accepts a test answer in its place. Real keys always return the action.
    const isTestAnswer = env.TURNSTILE_TEST_MODE === 'true' && result.metadata?.result_with_testing_key === true;
    const actionMatches = result.action === TURNSTILE_ACTION || isTestAnswer;
    return result.success === true && actionMatches && hostnames.has(result.hostname);
  } catch {
    return false;
  }
}

function escapeHtml(text) {
  return text.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}
