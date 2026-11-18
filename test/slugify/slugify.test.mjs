import test from 'node:test';
import assert from 'node:assert/strict';
import { slugify } from '../../src/slugify.mjs';

test('normalization preserves punctuation and existing hyphens', () => {
  assert.equal(slugify(' \tA_B! -- C\n'), 'a_b!----c');
  assert.equal(slugify('ÉCOLE\u00a0中文'), 'école-中文');
});

test('invalid calls cannot coerce input or affect later calls', () => {
  const input = {
    [Symbol.toPrimitive]() {
      assert.fail('Input must not be coerced');
    },
  };
  for (const value of [input, new String('text'), '', '\u00a0\ufeff']) {
    assert.throws(() => slugify(value), TypeError);
    assert.equal(slugify(' Valid Again '), 'valid-again');
  }
});
