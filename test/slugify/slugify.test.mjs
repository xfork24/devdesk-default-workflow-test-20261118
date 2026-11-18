import test from 'node:test';
import assert from 'node:assert/strict';
import { slugify } from '../../src/slugify.mjs';

test('slugify folds whitespace and preserves existing punctuation', () => {
  assert.equal(slugify(' Hello World '), 'hello-world');
  assert.equal(slugify('A\t B\nC'), 'a-b-c');
  assert.equal(slugify(' --A_B!  C-- '), '--a_b!-c--');
});

test('slugify rejects invalid values synchronously and recovers', () => {
  const object = {
    toString() { assert.fail('Invalid values must not be converted'); },
  };
  for (const value of ['', ' \t\n ', null, undefined, 0, false, object, new String('A')]) {
    assert.throws(() => slugify(value), TypeError);
  }
  assert.throws(() => slugify(), TypeError);
  assert.equal(slugify(' Next Value '), 'next-value');
  assert.equal(slugify(' Next Value '), 'next-value');
});
