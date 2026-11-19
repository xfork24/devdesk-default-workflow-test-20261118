import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as baselineSlug from '../../src/baseline-slug.mjs';

// AC-01: synchronous named export; string equality also rejects Promise returns.
test('slugify is a named synchronous function returning a primitive string', () => {
  assert.equal(typeof baselineSlug.slugify, 'function');
  const result = baselineSlug.slugify(' Example 42 ');
  assert.equal(typeof result, 'string');
  assert.equal(result, 'example-42');
});

// AC-02: preserve the exact acceptance examples.
test('slugify converts the three required examples', () => {
  for (const [input, expected] of [
    ['  Hello, World!  ', 'hello-world'],
    [' A----B___C ', 'a-b-c'],
    ['Already-OK42', 'already-ok42'],
  ]) {
    assert.equal(baselineSlug.slugify(input), expected, JSON.stringify(input));
  }
});

// AC-03: an empty result is a normal string return.
test('slugify returns empty strings for empty or entirely excluded input', () => {
  for (const input of ['', '___', '中文', ' \t\r\n ', '---!?---', '😀']) {
    assert.equal(baselineSlug.slugify(input), '', JSON.stringify(input));
  }
});

// AC-01/AC-02: collapse entire runs, keep ASCII digits, remove edge separators.
test('slugify collapses mixed separator runs and removes both edge separators', () => {
  for (const [input, expected] of [
    ['---A__ \t!?B///C---', 'a-b-c'],
    ['\uFEFF\u00A0ABC\r\n123\u00A0', 'abc-123'],
    ['0 1_2-3', '0-1-2-3'],
    ['a中文😀b', 'a-b'],
    ['-0-', '0'],
  ]) {
    assert.equal(baselineSlug.slugify(input), expected, JSON.stringify(input));
  }
});

// AC-01: lowercase precedes ASCII filtering; normalization/transliteration is absent.
test('slugify uses native Unicode lowercasing before ASCII filtering', () => {
  for (const [input, expected] of [
    ['K', 'k'],
    ['AİB', 'ai-b'],
    ['École déjà vu', 'cole-d-j-vu'],
    ['é', ''],
    ['e\u0301', 'e'],
    ['ＡＢＣ１２３', ''],
    ['Straße', 'stra-e'],
  ]) {
    assert.equal(baselineSlug.slugify(input), expected, JSON.stringify(input));
  }
});

// AC-04: require TypeError synchronously, without committing to message text.
test('slugify rejects all tested non-string types without coercion', () => {
  let coercions = 0;
  const hostileObject = {
    [Symbol.toPrimitive]() { coercions += 1; throw new Error('unexpected coercion'); },
    toString() { coercions += 1; throw new Error('unexpected coercion'); },
    valueOf() { coercions += 1; throw new Error('unexpected coercion'); },
  };
  const invalidValues = [
    42, 0, NaN, Infinity, null, undefined, true, false,
    {}, [], ['hello'], Symbol('hello'), 42n, () => 'hello',
    new String('hello'), new String(''), hostileObject,
  ];
  for (const value of invalidValues) {
    assert.throws(() => baselineSlug.slugify(value), TypeError);
  }
  assert.equal(coercions, 0);
  assert.equal(baselineSlug.slugify(' After error '), 'after-error');
});

// AC-01: stateless repeated calls and normalized-output invariants.
test('slugify is deterministic and idempotent across interleaved calls', () => {
  for (const [input, expected] of [
    ['  Hello, World!  ', 'hello-world'],
    ['中文', ''],
    ['A----B___C', 'a-b-c'],
    ['0', '0'],
  ]) {
    const actual = baselineSlug.slugify(input);
    assert.equal(actual, expected);
    baselineSlug.slugify('unrelated input');
    assert.equal(baselineSlug.slugify(input), expected);
    assert.equal(baselineSlug.slugify(expected), expected);
    assert.match(actual, /^(?:[a-z0-9]+(?:-[a-z0-9]+)*)?$/);
  }
});
