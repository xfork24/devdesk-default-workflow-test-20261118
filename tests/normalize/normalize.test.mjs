import test from 'node:test';
import assert from 'node:assert/strict';
import { normalize } from '../../src/normalize.mjs';

// Task A: AC-A1 / AC-A2. Assert public return values and exception types.
test('A1: ordinary strings retain their contents and case', () => {
  assert.equal(normalize('Alice'), 'Alice');
  assert.equal(normalize('aLiCe'), 'aLiCe');
});

test('A1: leading and trailing whitespace is trimmed', () => {
  assert.equal(normalize('  Alice  '), 'Alice');
  assert.equal(normalize('\t\nAlice\r\n'), 'Alice');
  assert.equal(normalize('\u00a0\u2003Alice\uFEFF'), 'Alice');
});

test('A1: internal whitespace and case are preserved', () => {
  assert.equal(normalize(' \tAlIce  van\tDYKE\nJr \r'), 'AlIce  van\tDYKE\nJr');
});

for (const [label, value] of [
  ['empty string', ''],
  ['spaces', '   '],
  ['tabs and line breaks', '\t\r\n'],
  ['Unicode whitespace', '\u00a0\u2003\uFEFF'],
]) {
  test(`A2: rejects ${label} with TypeError`, () => {
    assert.throws(() => normalize(value), TypeError);
  });
}

for (const [label, value] of [
  ['null', null],
  ['undefined', undefined],
  ['number', 42],
  ['zero', 0],
  ['NaN', NaN],
  ['boolean', false],
  ['bigint', 1n],
  ['symbol', Symbol('Alice')],
  ['array', ['Alice']],
  ['object', {}],
  ['function', () => 'Alice'],
  ['boxed string', new String('Alice')],
  ['string-coercible object', { toString: () => 'Alice' }],
  ['object with trim method', { trim: () => 'Alice' }],
]) {
  test(`A2: rejects non-string ${label} with TypeError`, () => {
    assert.throws(() => normalize(value), TypeError);
  });
}

test('A2: missing argument throws TypeError', () => {
  assert.throws(() => normalize(), TypeError);
});
