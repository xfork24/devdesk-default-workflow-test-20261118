import test from 'node:test';
import assert from 'node:assert/strict';
import { slugify } from '../../src/slugify.mjs';

test('AC-01: original acceptance examples return primitive strings synchronously', () => {
  for (const [value, expected] of [
    [' Hello World ', 'hello-world'],
    ['A\t B\nC', 'a-b-c'],
    ['already-slug', 'already-slug'],
    ['ZERO 0', 'zero-0'],
  ]) {
    assert.strictEqual(slugify(value), expected);
  }
});

test('AC-02: JavaScript whitespace collapses while other characters are preserved', () => {
  for (const [value, expected] of [
    [' A__B!  C--D ', 'a__b!-c--d'],
    ['\u00a0A\t\n\r\v\f B\u00a0\u2003C\u2028\u2029D\ufeff', 'a-b-c-d'],
    [' ÉCOLE Café /?&=+#.@_-- 中文 😀 ', 'école-café-/?&=+#.@_---中文-😀'],
    ['--A--', '--a--'],
    ['A\u200bB', 'a\u200bb'],
    ['\u0130', 'i\u0307'],
  ]) {
    assert.strictEqual(slugify(value), expected);
  }
});

test('AC-03: empty or whitespace-only strings synchronously throw TypeError', () => {
  for (const value of ['', ' ', '\t\n', '\r\v\f', '\u00a0\u2003\u2028\u2029\ufeff']) {
    assert.throws(() => slugify(value), TypeError);
  }
});

test('AC-04: non-primitive strings and missing arguments are rejected without coercion', () => {
  for (const value of [null, undefined, 0, NaN, true, false, {}, [], Symbol('slug'), 0n,
    new String('Hello World'), () => 'Hello World', Promise.resolve('Hello World')]) {
    assert.throws(() => slugify(value), TypeError);
  }
  assert.throws(() => slugify(), TypeError);

  const calls = [];
  const value = {
    [Symbol.toPrimitive]() { calls.push('toPrimitive'); return 'Hello World'; },
    toString() { calls.push('toString'); return 'Hello World'; },
    valueOf() { calls.push('valueOf'); return 'Hello World'; },
  };
  try {
    assert.throws(() => slugify(value), TypeError);
  } finally {
    assert.deepStrictEqual(calls, []);
  }
});

test('AC-05: repeated calls are consistent and rejection does not affect later calls', () => {
  assert.strictEqual(slugify(' Repeat  ME! '), 'repeat-me!');
  assert.strictEqual(slugify(' Repeat  ME! '), 'repeat-me!');
  assert.throws(() => slugify(null), TypeError);
  assert.strictEqual(slugify(' After\tFailure '), 'after-failure');
  assert.throws(() => slugify(' \n'), TypeError);
  assert.strictEqual(slugify(' Repeat  ME! '), 'repeat-me!');
});
