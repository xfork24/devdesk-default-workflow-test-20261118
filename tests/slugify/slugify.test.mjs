import test from 'node:test';
import assert from 'node:assert/strict';
import { slugify } from '../../src/slugify.mjs';

// Frozen Task bdcd0d5e-a4d5-f7d8-fe04-812d529f78b9, tests round 2.
// Platform prepares the callable empty interface before measuring Red.
// Import/load failures are infrastructure failures, never behavioral Red.

test('slug-01: named export returns a primitive string synchronously [AC-01]', () => {
  assert.equal(typeof slugify, 'function');
  const result = slugify('Example');
  assert.equal(typeof result, 'string');
  assert.equal(result, 'example');
});

test('slug-02: trim, collapse whitespace and lowercase [AC-02]', () => {
  const cases = [
    [' Hello World ', 'hello-world'],
    ['A\t B\nC', 'a-b-c'],
    ['\r\n  HELLO\t\t WORLD \n', 'hello-world'],
    ['A  \t\r\n  B', 'a-b'],
    ['\tX\n', 'x'],
  ];
  for (const [input, expected] of cases) {
    assert.equal(slugify(input), expected, JSON.stringify(input));
  }
});

test('slug-03: ECMAScript whitespace trims and collapses [AC-02, AC-05]', () => {
  const whitespace = [
    '\u0009', '\u000a', '\u000b', '\u000c', '\u000d', '\u0020',
    '\u00a0', '\u1680', '\u2000', '\u2001', '\u2002', '\u2003',
    '\u2004', '\u2005', '\u2006', '\u2007', '\u2008', '\u2009',
    '\u200a', '\u2028', '\u2029', '\u202f', '\u205f', '\u3000', '\ufeff',
  ];
  for (const space of whitespace) {
    const label = `U+${space.codePointAt(0).toString(16)}`;
    assert.equal(slugify(`${space}A${space}${space}B${space}`), 'a-b', label);
    assert.throws(() => slugify(space + space), TypeError, label);
  }
  assert.throws(() => slugify('\t \u00a0\u2028\ufeff\n'), TypeError);
});

test('slug-04: existing hyphens and numbers survive [AC-03]', () => {
  assert.equal(slugify('already-slug'), 'already-slug');
  assert.equal(slugify('ZERO 0'), 'zero-0');
  assert.equal(slugify('0'), '0');
});

test('slug-05: preserve all characters beyond whitespace and lowercase [AC-04]', () => {
  const cases = [
    [' A_B! -- C ', 'a_b!----c'],
    ['A_B!@#$%^&*()+={}[]:;,.?/\\|~`', 'a_b!@#$%^&*()+={}[]:;,.?/\\|~`'],
    ['--A---B--', '--a---b--'],
    [' A - B ', 'a---b'],
    ['---', '---'],
    ['ÉCOLE 中文 😀 İ', 'école-中文-😀-i\u0307'],
    ['\u0085A\u180eB\u200b', '\u0085a\u180eb\u200b'],
  ];
  for (const [input, expected] of cases) {
    assert.equal(slugify(input), expected, JSON.stringify(input));
  }
});

test('slug-06: reject empty and every non-string category, then recover [AC-05]', () => {
  const invalid = [
    '', '   ', '\t\r\n', null, undefined, 0, -1, NaN, Infinity,
    true, false, {}, [], ['text'], function example() {},
    Symbol('text'), 0n, new String('text'), new String(''),
    Object.create(null),
  ];
  for (const value of invalid) {
    assert.throws(() => slugify(value), TypeError);
    assert.equal(slugify(' Valid Again '), 'valid-again');
  }
  assert.throws(() => slugify(), TypeError);
});

test('slug-07: no implicit conversion hooks run [AC-05]', () => {
  const calls = [];
  const withPrimitiveHook = {
    [Symbol.toPrimitive]() { calls.push('Symbol.toPrimitive'); return 'Text'; },
  };
  const withLegacyHooks = {
    toString() { calls.push('toString'); return 'Text'; },
    valueOf() { calls.push('valueOf'); return 'Text'; },
  };
  for (const value of [withPrimitiveHook, withLegacyHooks]) {
    assert.throws(() => slugify(value), TypeError);
  }
  assert.deepEqual(calls, []);
  assert.equal(slugify(' Still Valid '), 'still-valid');
});
