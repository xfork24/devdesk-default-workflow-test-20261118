import test from 'node:test';
import assert from 'node:assert/strict';
import { slugify } from '../../src/baseline-slug.mjs';

test('converts strings to ASCII slugs and collapses separators', () => {
  for (const [input, expected] of [
    ['  Hello, World!  ', 'hello-world'],
    [' A----B___C ', 'a-b-c'],
    ['Already-OK42', 'already-ok42'],
    ['---A_! /\t\nB+++009---', 'a-b-009'],
    ['a中文😀b', 'a-b'],
  ]) {
    assert.equal(slugify(input), expected, JSON.stringify(input));
  }
});

test('lowercases before ASCII filtering without transliteration', () => {
  assert.equal(slugify('K'), 'k');
  assert.equal(slugify('İ'), 'i');
  assert.equal(slugify('Café déjà'), 'caf-d-j');
});

test('returns an empty string when no ASCII letters or digits remain', () => {
  for (const input of ['', '___', '中文', ' \t\n ', '---!!!😀']) {
    assert.equal(slugify(input), '', JSON.stringify(input));
  }
});

test('rejects non-string values without coercion', () => {
  let coerced = false;
  const coercible = {
    [Symbol.toPrimitive]() { coerced = true; return 'hello'; },
    toString() { coerced = true; return 'hello'; },
  };
  for (const input of [42, null, undefined, true, false, 0, NaN, 1n,
    Symbol('slug'), [], ['hello'], {}, new String('hello'), () => 'hello', coercible]) {
    assert.throws(() => slugify(input), TypeError);
  }
  assert.equal(coerced, false);
});
