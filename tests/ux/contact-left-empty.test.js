// UX test: a contact form field left empty (contact/index.html, src/js/modules/contact-form.js).
//
// The rule: if the visitor leaves a field empty, it turns red and says "Please fill in…" under it, so they know it's
// needed. It's only after they've had a go at the field (left it, or pressed Send), never before, so a field they
// haven't reached yet stays neutral. The message goes as soon as they start typing in it (a different, fix-it message
// covers something typed that isn't right yet), and pressing Send on an empty form shows it for every field.
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

// For each field: is its "Please fill in…" message showing, and is its outline red?
const leftEmpty = (page) => page.evaluate((ids) => Object.fromEntries(ids.map((id) => {
  const field = document.getElementById(id);
  const message = document.getElementById(`${id}-missing`);
  const showing = parseFloat(getComputedStyle(message).opacity) > 0.5;
  const red = getComputedStyle(field).boxShadow.includes('255, 107, 107'); // --error-color
  return [id, { showing, red, text: message.textContent }];
})), fields);

const openForm = async () => {
  const page = await openPage(site.browser, `${site.url}/contact/`);
  await page.waitForSelector('#contact-name');
  return page;
};
// Waits out the message's slide-open transition before reading it.
const settle = () => new Promise((resolve) => setTimeout(resolve, 450));

test('a field left empty turns red and says "Please fill in…"; fields not reached yet stay neutral', async () => {
  const page = await openForm();
  await page.click('#contact-name');
  await page.click('#contact-company'); // left the name empty
  await settle();
  const state = await leftEmpty(page);
  assert.deepEqual(state['contact-name'], { showing: true, red: true, text: 'Please fill in your full name.' });
  assert.equal(state['contact-company'].showing, false, 'the field they are in now');
  assert.equal(state['contact-email'].showing, false, 'a field not reached yet');
  assert.equal(state['contact-email'].red, false, 'a field not reached yet');
  assert.deepEqual(page.errors, []);
  await page.close();
});

test('the message goes as soon as they start typing in the field', async () => {
  const page = await openForm();
  await page.click('#contact-name');
  await page.click('#contact-company');
  await page.click('#contact-name');
  await page.type('#contact-name', 'Alex');
  await settle();
  assert.equal((await leftEmpty(page))['contact-name'].showing, false);
  await page.close();
});

test('pressing Send on an empty form shows "Please fill in…" for every field', async () => {
  const page = await openForm();
  await page.click('.contact-form__submit');
  await page.click('#contact-message'); // move off the first field, which Send focused
  await page.$eval('#contact-message', (field) => field.blur());
  await settle();
  const state = await leftEmpty(page);
  for (const id of fields) {
    assert.equal(state[id].showing, true, `${id} message`);
    assert.equal(state[id].red, true, `${id} outline`);
  }
  await page.close();
});
