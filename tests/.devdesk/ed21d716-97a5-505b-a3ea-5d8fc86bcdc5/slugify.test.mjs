import test from 'node:test';
import assert from 'node:assert/strict';
import * as subject from '../../../src/baseline-slug.mjs';

test('AC-4: exposes a callable named slugify export', () => {
  assert.equal(typeof subject.slugify, 'function');
});

test('AC-1: specified conversions and separator runs', () => {
  const examples = [
    ['  Hello, World!  ', 'hello-world'],
    [' A----B___C ', 'a-b-c'],
    ['Already-OK42', 'already-ok42'],
    ['---A_! /\t\nB+++009---', 'a-b-009'],
    ['ABC012xyz', 'abc012xyz'],
    ['a中文😀b', 'a-b'],
    ['\u00a0Hello\u00a0', 'hello'],
  ];
  for (const [input, expected] of examples) {
    assert.equal(subject.slugify(input), expected, JSON.stringify(input));
  }
});

test('AC-1: lowercase precedes ASCII filtering, without transliteration', () => {
  assert.equal(subject.slugify('\u212A'), 'k');
  assert.equal(subject.slugify('\u0130'), 'i');
  assert.equal(subject.slugify('Café déjà'), 'caf-d-j');
});

test('AC-2: empty and entirely non-ASCII-alphanumeric inputs', () => {
  for (const input of ['', '___', '中文', ' \t\n ', '---!!!😀']) {
    assert.equal(subject.slugify(input), '', JSON.stringify(input));
  }
});

test('AC-3: rejects non-string values with TypeError and no coercion', () => {
  let coerced = false;
  const coercible = {
    [Symbol.toPrimitive]() { coerced = true; return 'hello'; },
    toString() { coerced = true; return 'hello'; },
  };
  for (const input of [42, null, undefined, true, false, 0, NaN, 1n,
    Symbol('slug'), [], ['hello'], {}, new String('hello'), () => 'hello', coercible]) {
    assert.throws(() => subject.slugify(input), TypeError);
  }
  assert.equal(coerced, false);
});
