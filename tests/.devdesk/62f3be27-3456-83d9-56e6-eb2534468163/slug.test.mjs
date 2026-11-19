import { test } from 'node:test';
import assert from 'node:assert/strict';
import { slugify } from '../../../src/baseline-slug.mjs';

test('AC-01: exact examples return synchronous ASCII slugs', () => {
  for (const [input, expected] of [
    ['  Hello, World!  ', 'hello-world'],
    [' A----B___C ', 'a-b-c'],
    ['Already-OK42', 'already-ok42'],
  ]) {
    assert.equal(slugify(input), expected);
  }
});

test('AC-01: separators collapse and edge separators disappear', () => {
  for (const [input, expected] of [
    ['---A__ \t\n!!B---', 'a-b'],
    ['0__9', '0-9'],
    ['abcdefghijklmnopqrstuvwxyz0123456789', 'abcdefghijklmnopqrstuvwxyz0123456789'],
    ['a-b-c', 'a-b-c'],
  ]) {
    assert.equal(slugify(input), expected);
    assert.equal(slugify(input), expected);
  }
});

test('AC-02: inputs without surviving ASCII letters or digits return empty strings', () => {
  for (const input of ['', '___', '中文', ' \t\n ', '---!?', 'é😀']) {
    assert.equal(slugify(input), '');
  }
});

test('AC-01/AC-02: JavaScript lowercase precedes ASCII filtering without transliteration', () => {
  for (const [input, expected] of [
    ['CAFÉ 中文 42', 'caf-42'],
    ['K', 'k'],
    ['İA', 'i-a'],
    ['ＡＢＣ', ''],
  ]) {
    assert.equal(slugify(input), expected);
  }
});

test('AC-03: every representative non-primitive-string type throws TypeError synchronously', () => {
  let coerced = false;
  const coercible = { toString() { coerced = true; return 'hello'; } };
  for (const input of [
    42, null, undefined, new String('hello'), {}, [], ['hello'],
    true, false, 0, NaN, 42n, Symbol('hello'), () => 'hello', coercible,
  ]) {
    assert.throws(() => slugify(input), TypeError);
  }
  assert.equal(coerced, false);
});
