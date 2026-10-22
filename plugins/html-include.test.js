// Run with: npm run test:include
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { renderIncludes, fillVars, markCurrentNav, pageUrl, nextCaseStudy } from './html-include.js';

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'partials-'));
fs.writeFileSync(path.join(dir, 'greet.html'), '<p>Hi {{name}} from {{site.name}}</p>');
fs.writeFileSync(path.join(dir, 'outer.html'), '<div><include src="greet.html" name="{{who}}"></include></div>');
fs.writeFileSync(path.join(dir, 'loop.html'), '<include src="loop.html"></include>');

test('includes a partial with attribute and global variables', () => {
  const out = renderIncludes('<include src="greet.html" name="Sam"></include>', dir, { 'site.name': 'Gemma' });
  assert.equal(out, '<p>Hi Sam from Gemma</p>');
});

test('handles multi-line include tags', () => {
  const out = renderIncludes('<include\n  src="greet.html"\n  name="Sam"\n></include>', dir, {});
  assert.equal(out, '<p>Hi Sam from {{site.name}}</p>');
});

test('supports nested partials', () => {
  const out = renderIncludes('<include src="outer.html" who="Ana"></include>', dir, { 'site.name': 'G' });
  assert.match(out, /<div><p>Hi .* from G<\/p><\/div>/);
});

test('reports a missing partial clearly', () => {
  assert.throws(() => renderIncludes('<include src="nope.html"></include>', dir), /Partial not found: "nope.html"/);
});

test('stops circular includes', () => {
  assert.throws(() => renderIncludes('<include src="loop.html"></include>', dir), /nested more than/);
});

test('leaves unknown variables untouched', () => {
  assert.equal(fillVars('{{a}} {{b}}', { a: 1 }), '1 {{b}}');
});

test('marks the current page and section in the nav', () => {
  const nav = '<a href="/about/" data-nav="/about/"><a href="/#work" data-nav="/work/">';
  assert.equal(markCurrentNav(nav, '/about/'), '<a href="/about/" aria-current="page"><a href="/#work">');
  assert.equal(markCurrentNav(nav, '/work/lndmrk/'), '<a href="/about/"><a href="/#work" aria-current="true">');

  const home = '<a href="/" data-nav="/">';
  assert.equal(markCurrentNav(home, '/'), '<a href="/" aria-current="page">');
  assert.equal(markCurrentNav(home, '/work/'), '<a href="/">');
});

test('turns request paths into page URLs', () => {
  assert.equal(pageUrl('/about/index.html'), '/about/');
  assert.equal(pageUrl('/index.html'), '/');
  assert.equal(pageUrl('/404.html'), '/404.html');
});

test('finds the next case study, looping back to the first', () => {
  const list = [{ slug: 'a', name: 'A' }, { slug: 'b', name: 'B' }, { slug: 'c', name: 'C' }];
  assert.deepEqual(nextCaseStudy(list, '/work/a/'), { 'next.href': '/work/b/', 'next.name': 'B' });
  assert.deepEqual(nextCaseStudy(list, '/work/c/'), { 'next.href': '/work/a/', 'next.name': 'A' });
  assert.deepEqual(nextCaseStudy(list, '/work/'), {});
  assert.deepEqual(nextCaseStudy(list, '/'), {});
});
