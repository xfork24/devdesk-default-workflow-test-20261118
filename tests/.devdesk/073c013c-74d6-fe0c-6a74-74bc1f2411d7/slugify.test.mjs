import test from 'node:test';
import assert from 'node:assert/strict';
import { slugify } from '../../../src/baseline-slug.mjs';

const examples = [
  ['  Hello, World!  ', 'hello-world'],
  [' A----B___C ', 'a-b-c'],
  ['Already-OK42', 'already-ok42'],
  ['', ''],
  ['___', ''],
  ['中文', ''],
];

for (const [input, expected] of examples) {
  test(`AC-1 specified example ${JSON.stringify(input)}`, () => {
    assert.equal(slugify(input), expected);
  });
}

test('AC-1 collapses mixed separator runs and removes edge separators', () => {
  assert.equal(slugify('--A__ \t!?B---中文__C--'), 'a-b-c');
  assert.equal(slugify(' \t\n '), '');
  assert.equal(slugify('0123456789abcdefghijklmnopqrstuvwxyz'), '0123456789abcdefghijklmnopqrstuvwxyz');
});

test('AC-1 lowercases before filtering and performs no transliteration', () => {
  assert.equal(slugify('İ'), 'i');
  assert.equal(slugify('École café'), 'cole-caf');
});

const invalidInputs = [42, null, undefined, true, 0n, Symbol('slug'), {}, [], new String('hello'), () => 'hello'];
for (const [index, input] of invalidInputs.entries()) {
  test(`AC-2 rejects non-string input ${index} synchronously`, () => {
    assert.throws(() => slugify(input), TypeError);
  });
}

test('AC-2 does not coerce objects; failed calls do not affect later results', () => {
  let coerced = false;
  const input = { [Symbol.toPrimitive]() { coerced = true; return 'hello'; } };
  assert.throws(() => slugify(input), TypeError);
  assert.equal(coerced, false);
  assert.equal(slugify(' Next Call '), 'next-call');
  assert.equal(slugify(' Next Call '), 'next-call');
});
