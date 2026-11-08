// UX test: the contact form's errors for screen reader users (contact/index.html, src/js/modules/contact-form.js).
//
// The rule (WCAG 3.3.1 and 4.1.3): what sighted visitors see, screen reader users hear. A field the visitor has had a
// go at that still isn't right is marked invalid (aria-invalid), at the same moment its red outline and message show,
// never before; it's unmarked once put right. Pressing Send while fields still need something says how many and which
// ("2 fields need attention: Full name, Work email.") in a status message read out without moving focus, and focus goes
// to the first of them.
import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { openPage, startSite } from './helpers.js';

let site;
before(async () => {
  site = await startSite();
});
after(async () => {
  await site?.stop();
});

const fields = ['contact-name', 'contact-company', 'contact-email', 'contact-message'];
const invalid = (page) => page.evaluate((ids) => ids.filter((id) => document.getElementById(id).getAttribute('aria-invalid') === 'true'), fields);
const announced = (page) => page.$eval('[data-contact-announce]', (status) => status.textContent);

const openForm = async () => {
  const page = await openPage(site.browser, `${site.url}/contact/`);
  await page.waitForSelector('#contact-name');
  return page;
};

test('nothing is marked invalid before the visitor has had a go', async () => {
  const page = await openForm();
  assert.deepEqual(await invalid(page), [], 'on load');
  await page.click('#contact-name');
  await page.type('#contact-name', 'Alex');
  assert.deepEqual(await invalid(page), [], 'while still typing in a field');
  assert.equal(await announced(page), '');
  assert.deepEqual(page.errors, []);
  await page.close();
});

test('a field left empty or wrong is marked invalid, and unmarked once put right', async () => {
  const page = await openForm();
  await page.click('#contact-name');
  await page.click('#contact-company'); // left the name empty
  assert.deepEqual(await invalid(page), ['contact-name']);

  await page.type('#contact-company', 'Acme');
  await page.click('#contact-email');
  await page.type('#contact-email', 'alex@acme');
  await page.click('#contact-company'); // left the email wrong (the message box is never visited, so stays neutral)
  assert.deepEqual(await invalid(page), ['contact-name', 'contact-email']);

  await page.click('#contact-name');
  await page.type('#contact-name', 'Alex Morgan');
  await page.click('#contact-email');
  await page.type('#contact-email', '.com');
  await page.click('#contact-company');
  assert.deepEqual(await invalid(page), [], 'once both are put right');
  await page.close();
});

test('Send says how many fields need attention and which, and goes to the first', async () => {
  const page = await openForm();
  await page.type('#contact-company', 'Acme');
  await page.type('#contact-message', 'Hello, a longer message here.');
  await page.click('.contact-form__submit');
  await page.waitForFunction(() => document.querySelector('[data-contact-announce]').textContent !== '');
  assert.equal(await announced(page), '2 fields need attention: Full name, Work email.');
  assert.deepEqual(await invalid(page), ['contact-name', 'contact-email']);
  assert.equal(await page.evaluate(() => document.activeElement?.id), 'contact-name');
  assert.equal(await page.$eval('[data-contact-announce]', (status) => status.getAttribute('role')), 'status');
  await page.close();
});

test('Send on an empty form names all four', async () => {
  const page = await openForm();
  await page.click('.contact-form__submit');
  await page.waitForFunction(() => document.querySelector('[data-contact-announce]').textContent !== '');
  assert.equal(await announced(page), '4 fields need attention: Full name, Company name, Work email, Your message.');
  await page.close();
});
