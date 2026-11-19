import { test } from 'node:test';
import assert from 'node:assert/strict';
import { slugify } from '../../../src/baseline-slug.mjs';

test('exact acceptance examples', () => {
  for (const [input, expected] of [
    ['  Hello, World!  ', 'hello-world'],
    [' A----B___C ', 'a-b-c'],
    ['Already-OK42', 'already-ok42'],
    ['', ''], ['___', ''], ['中文', ''],
  ]) {
    assert.equal(slugify(input), expected, JSON.stringify(input));
  }
});

test('ASCII boundaries, separator runs, and native lowercase before filtering', () => {
  for (const [input, expected] of [
    ['ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 'abcdefghijklmnopqrstuvwxyz0123456789'],
    [' / A\t\n___---中文😀B / ', 'a-b'],
    ['éàöß中文😀', ''],
    ['déjà vu', 'd-j-vu'],
    ['\u212A', 'k'],
    ['\u0130', 'i'],
    ['A\u0130B', 'ai-b'],
    ['\u00a0\ufeff A_B \u00a0', 'a-b'],
    ['０Ａ１', ''],
    ['a@b[c]d`e{f}g', 'a-b-c-d-e-f-g'],
    ['a\u0000b', 'a-b'],
  ]) {
    const actual = slugify(input);
    assert.equal(actual, expected, JSON.stringify(input));
    assert.equal(typeof actual, 'string');
    assert.match(actual, /^(?:[a-z0-9]+(?:-[a-z0-9]+)*)?$/);
  }
});

test('all non-string categories synchronously throw TypeError without coercion', () => {
  let conversions = 0;
  const observable = {
    [Symbol.toPrimitive]() { conversions++; return 'converted'; },
    toString() { conversions++; return 'converted'; },
    valueOf() { conversions++; return 1; },
  };
  const values = [42, NaN, Infinity, null, undefined, true, false, {}, [],
    ['hello'], () => 'hello', Symbol('hello'), 1n, new String('hello'),
    Object.create(null), observable];
  for (const value of values) {
    assert.throws(() => slugify(value), TypeError);
    assert.equal(conversions, 0);
    assert.equal(slugify(' Recovery_OK '), 'recovery-ok');
  }
});

test('repeated and interleaved calls retain no shared state', () => {
  for (let i = 0; i < 3; i++) {
    assert.equal(slugify(' A___B '), 'a-b');
    assert.equal(slugify('中文'), '');
    assert.equal(slugify('Already-OK42'), 'already-ok42');
    assert.equal(slugify(' A___B '), 'a-b');
  }
});
