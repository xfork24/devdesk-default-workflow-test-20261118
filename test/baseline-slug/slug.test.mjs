import { test } from 'node:test';
import assert from 'node:assert/strict';
import { slugify } from '../../src/baseline-slug.mjs';

test('converts examples and collapses separators at boundaries', () => {
  for (const [input, expected] of [
    ['  Hello, World!  ', 'hello-world'],
    [' A----B___C ', 'a-b-c'],
    ['Already-OK42', 'already-ok42'],
    ['---A__ \t\n!!B---', 'a-b'],
    ['0__9', '0-9'],
    ['abcdefghijklmnopqrstuvwxyz0123456789', 'abcdefghijklmnopqrstuvwxyz0123456789'],
    ['a-b-c', 'a-b-c'],
  ]) {
    assert.equal(slugify(input), expected);
    assert.equal(slugify(input), expected);
  }
});

test('returns an empty string when no ASCII letters or digits survive', () => {
  for (const input of ['', '___', '中文', ' \t\n ', '---!?', 'é😀']) {
    assert.equal(slugify(input), '');
  }
});

test('lowercases before ASCII filtering without transliteration', () => {
  for (const [input, expected] of [
    ['K', 'k'], ['İA', 'i-a'], ['CAFÉ 中文 42', 'caf-42'], ['ＡＢＣ', ''],
  ]) {
    assert.equal(slugify(input), expected);
  }
});

test('rejects non-primitive strings synchronously without coercion', () => {
  let coerced = false;
  const coercible = { toString() { coerced = true; return 'hello'; } };
  for (const value of [
    42, null, undefined, new String('hello'), {}, [], ['hello'],
    true, false, 0, NaN, 42n, Symbol('hello'), () => 'hello', coercible,
  ]) {
    assert.throws(() => slugify(value), TypeError);
  }
  assert.equal(coerced, false);
});
