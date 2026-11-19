import test from 'node:test';
import assert from 'node:assert/strict';
import { slugify } from '../../src/baseline-slug.mjs';

const examples = [
  ['  Hello, World!  ', 'hello-world'],
  [' A----B___C ', 'a-b-c'],
  ['Already-OK42', 'already-ok42'],
  ['', ''],
  ['___', ''],
  ['中文', ''],
  ['--A__ \t!?B---中文__C--', 'a-b-c'],
  [' \t\n ', ''],
  ['0123456789abcdefghijklmnopqrstuvwxyz', '0123456789abcdefghijklmnopqrstuvwxyz'],
  ['İ', 'i'],
  ['École café', 'cole-caf'],
];

for (const [input, expected] of examples) {
  test(`converts ${JSON.stringify(input)} to ${JSON.stringify(expected)}`, () => {
    assert.equal(slugify(input), expected);
  });
}

test('rejects non-string values synchronously', () => {
  for (const value of [42, null, undefined, true, 0n, Symbol('slug'), {}, [], new String('hello'), () => 'hello']) {
    assert.throws(() => slugify(value), TypeError);
  }
});

test('does not coerce input or retain state after rejection', () => {
  let coerced = false;
  const value = { [Symbol.toPrimitive]() { coerced = true; return 'hello'; } };
  assert.throws(() => slugify(value), TypeError);
  assert.equal(coerced, false);
  assert.equal(slugify(' Next Call '), 'next-call');
  assert.equal(slugify(' Next Call '), 'next-call');
});
