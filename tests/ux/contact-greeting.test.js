// UX test: the contact form greets the visitor by name (contact/index.html, src/js/modules/contact-form.js).
//
// The rule: once the full name is right, the green line under it says "✓ Nice to meet you, Alex", with the first word
// of the name they typed (extra spaces ignored), so the form feels like a conversation. What they type is shown as
// plain text, never as HTML, and the greeting goes back to "✓ Nice to meet you" when the name is cleared.
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

const typeName = async (page, name) => {
  await page.$eval('#contact-name', (field) => { field.value = ''; });
  await page.type('#contact-name', name);
};
const greeting = (page) => page.$eval('.contact-form__good', (line) => line.textContent);

test('the green line greets the visitor by their first name', async () => {
  const page = await openPage(site.browser, `${site.url}/contact/`);
  await page.waitForSelector('#contact-name');

  await typeName(page, 'Alex Morgan');
  assert.equal(await greeting(page), '✓ Nice to meet you, Alex');

  await typeName(page, '  Sasha   Lee ');
  assert.equal(await greeting(page), '✓ Nice to meet you, Sasha', 'extra spaces are ignored');

  await typeName(page, '<b>Bo</b> Hi');
  assert.equal(await greeting(page), '✓ Nice to meet you, <b>Bo</b>', 'shown as typed');
  assert.equal(await page.$$eval('.contact-form__good b', (tags) => tags.length), 0, 'never turned into HTML');

  await page.$eval('#contact-name', (field) => {
    field.value = '';
    field.dispatchEvent(new Event('input', { bubbles: true }));
  });
  assert.equal(await greeting(page), '✓ Nice to meet you', 'back to the plain greeting when cleared');
  assert.deepEqual(page.errors, []);
  await page.close();
});
