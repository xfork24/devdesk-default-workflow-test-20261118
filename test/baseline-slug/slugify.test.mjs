import { test } from 'node:test';
import assert from 'node:assert/strict';
import { slugify } from '../../src/baseline-slug.mjs';

test('slugify converts the acceptance examples', () => {
  for (const [value, expected] of [
    ['  Hello, World!  ', 'hello-world'],
    [' A----B___C ', 'a-b-c'],
    ['Already-OK42', 'already-ok42'],
    ['', ''], ['___', ''], ['中文', ''],
  ]) {
    assert.equal(slugify(value), expected);
  }
});

test('slugify uses native lowercase before ASCII filtering without transliteration', () => {
  for (const [value, expected] of [
    ['ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 'abcdefghijklmnopqrstuvwxyz0123456789'],
    [' / A\t___中文😀B / ', 'a-b'],
    ['déjà vu', 'd-j-vu'],
    ['\u212A', 'k'], ['\u0130', 'i'], ['A\u0130B', 'ai-b'],
    ['０Ａ１', ''],
  ]) {
    assert.equal(slugify(value), expected);
  }
});

test('slugify rejects non-strings without coercion and permits subsequent calls', () => {
  let conversions = 0;
  const observable = {
    [Symbol.toPrimitive]() { conversions++; return 'text'; },
    toString() { conversions++; return 'text'; },
    valueOf() { conversions++; return 1; },
  };
  for (const value of [42, NaN, Infinity, null, undefined, true, false, {}, [],
    () => 'text', Symbol('text'), 1n, new String('text'), observable]) {
    assert.throws(() => slugify(value), TypeError);
    assert.equal(conversions, 0);
    assert.equal(slugify(' Recovery_OK '), 'recovery-ok');
  }
});

test('slugify remains repeatable across interleaved calls', () => {
  for (let i = 0; i < 3; i++) {
    assert.equal(slugify(' A___B '), 'a-b');
    assert.equal(slugify('中文'), '');
    assert.equal(slugify(' A___B '), 'a-b');
  }
});
