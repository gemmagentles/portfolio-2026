// UX test: the contact form's "Still needed" list (contact/index.html, src/js/modules/contact-form.js).
//
// The rule: it isn't fair to tell visitors something is "still needed" before they've had a chance to try. So the
// list starts hidden, and a field's pill only appears once the visitor has had a go at that field (left it empty or
// not right) or has pressed Send without it. Each pill is shown on its own: if everything is right except the email,
// only "email" shows. A field that's put right loses its pill, and the "Still needed:" label only shows with a pill.
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

// What the list shows right now: whether it's visible, and the fields in its visible pills.
const stillNeeded = (page) => page.evaluate(() => {
  const list = document.querySelector('[data-contact-need]');
  const visible = !list.hidden && getComputedStyle(list).display !== 'none';
  const pills = [...list.querySelectorAll('[data-need]')]
    .filter((pill) => !pill.hidden)
    .map((pill) => pill.textContent.replace(/^\d+/, '').trim());
  return { visible, pills };
});
const nothing = { visible: false, pills: [] };

const openForm = async () => {
  const page = await openPage(site.browser, `${site.url}/contact/`);
  await page.waitForSelector('[data-contact-form]');
  return page;
};

test('nothing is "still needed" before the visitor has tried', async () => {
  const page = await openForm();
  assert.deepEqual(await stillNeeded(page), nothing, 'on load');

  await page.click('#contact-name');
  await page.type('#contact-name', 'Alex Morgan');
  assert.deepEqual(await stillNeeded(page), nothing, 'while typing in a field');

  await page.click('#contact-company');
  assert.deepEqual(await stillNeeded(page), nothing, 'after leaving a field filled in correctly');
  assert.deepEqual(page.errors, []);
  await page.close();
});

test('a field gets its pill once the visitor skips it or gets it wrong, and loses it once put right', async () => {
  const page = await openForm();
  await page.click('#contact-name');
  await page.type('#contact-name', 'Alex Morgan');
  await page.click('#contact-company');
  await page.click('#contact-email'); // skipped the company
  assert.deepEqual(await stillNeeded(page), { visible: true, pills: ['company'] }, 'after skipping the company');

  await page.type('#contact-email', 'alex@acme');
  await page.click('#contact-message'); // left the email wrong
  assert.deepEqual(await stillNeeded(page), { visible: true, pills: ['company', 'email'] }, 'after a wrong email');

  await page.type('#contact-message', 'Hello, a longer message here.');
  await page.click('#contact-company');
  await page.type('#contact-company', 'Acme');
  await page.click('#contact-email');
  assert.deepEqual(await stillNeeded(page), { visible: true, pills: ['email'] }, 'after putting the company right');

  await page.type('#contact-email', '.com');
  await page.click('#contact-message');
  assert.deepEqual(await stillNeeded(page), nothing, 'when everything is right');
  assert.deepEqual(page.errors, []);
  await page.close();
});

test('only the field that is wrong shows, on its own', async () => {
  const page = await openForm();
  await page.type('#contact-name', 'Alex Morgan');
  await page.type('#contact-company', 'Acme');
  await page.type('#contact-email', 'alex@acme');
  await page.type('#contact-message', 'Hello, a longer message here.');
  await page.$eval('#contact-message', (field) => field.blur());
  assert.deepEqual(await stillNeeded(page), { visible: true, pills: ['email'] });
  await page.close();
});

test('pressing Send on an empty form shows every field, and goes to the first one', async () => {
  const page = await openForm();
  await page.click('.contact-form__submit');
  assert.deepEqual(await stillNeeded(page), { visible: true, pills: ['name', 'company', 'email', 'message'] });
  assert.equal(await page.evaluate(() => document.activeElement?.id), 'contact-name');
  assert.deepEqual(page.errors, []);
  await page.close();
});
