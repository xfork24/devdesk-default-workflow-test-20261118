import test from 'node:test';
import assert from 'node:assert/strict';
import { slugify } from '../../src/slugify.mjs';

test('AC-01/02: examples and character preservation', () => {
  for (const [value, expected] of [
    [' Hello World ', 'hello-world'],
    ['A\t B\nC', 'a-b-c'],
    ['already-slug', 'already-slug'],
    ['ZERO 0', 'zero-0'],
    [' A__B!  C--D ', 'a__b!-c--d'],
    ['\ufeffÉCOLE\u00a0\u2003中文 😀\u2029', 'école-中文-😀'],
    ['A\u200bB', 'a\u200bb'],
    ['İ', 'i\u0307'],
  ]) {
    assert.strictEqual(slugify(value), expected);
  }
});

test('AC-03/04: invalid inputs throw synchronously without conversion', () => {
  for (const value of ['', ' ', '\t\n', '\ufeff\u00a0\u2003', null, undefined,
    0, NaN, true, false, {}, [], Symbol('slug'), 0n, new String('slug'),
    () => 'slug', Promise.resolve('slug')]) {
    assert.throws(() => slugify(value), TypeError);
  }
  assert.throws(() => slugify(), TypeError);

  let conversions = 0;
  const convert = () => { conversions += 1; return 'slug'; };
  const value = { [Symbol.toPrimitive]: convert, toString: convert, valueOf: convert };
  assert.throws(() => slugify(value), TypeError);
  assert.strictEqual(conversions, 0);
});

test('AC-05: repeated calls and recovery from invalid input', () => {
  assert.strictEqual(slugify(' Repeat  ME! '), 'repeat-me!');
  assert.throws(() => slugify(null), TypeError);
  assert.strictEqual(slugify(' Repeat  ME! '), 'repeat-me!');
  assert.throws(() => slugify('\t\n'), TypeError);
  assert.strictEqual(slugify(' After\tFailure '), 'after-failure');
});
