import test from 'node:test';
import assert from 'node:assert/strict';
import { composeNames } from '../../src/compose.mjs';
import { normalize } from '../../src/normalize.mjs';

// Task C 60a3c73e-dbd4-9233-e9ae-d29cbff8fae2, tests round 2.
// Frozen workspace 8976180ffb09b1f78efb9ab13ff71ce2bd09a663.
// Inputs: execution-input:43f59ebc-2da6-5544-b508-2674440b4921:{task,design,test_configuration,workspace}.
// This file tests behavior; import/call structure and platform gates require review/receipts.

test('C prerequisite: real normalize accepts and rejects representative inputs', () => {
  assert.equal(normalize(' \tAlice\n'), 'Alice');
  assert.equal(normalize(' AlIce  van\tDYKE '), 'AlIce  van\tDYKE');
  for (const value of ['', ' \t\n', null, 42, undefined]) {
    assert.throws(() => normalize(value), TypeError);
  }
});

test('C1: multiple names use real A results, preserve order and input', () => {
  const values = [' Alice ', 'Bob', '\u00a0AlIce  van\tDYKE\uFEFF', ' Alice '];
  const before = values.slice();
  const expected = 'Alice, Bob, AlIce  van\tDYKE, Alice';
  assert.equal(values.map(value => normalize(value)).join(', '), expected);
  assert.equal(composeNames(values), expected);
  assert.deepEqual(values, before);
  assert.equal(composeNames(values), expected);
  assert.deepEqual(values, before);
});

test('C1: empty and single-item arrays have exact separators', () => {
  const empty = [];
  assert.equal(composeNames(empty), '');
  assert.deepEqual(empty, []);
  assert.equal(composeNames([' Alice ']), 'Alice');
  assert.equal(composeNames(['Alice', 'Bob']), 'Alice, Bob');
});

test('C1: frozen caller arrays remain usable and unchanged', () => {
  const values = Object.freeze([' Bob ', ' Alice ']);
  assert.equal(composeNames(values), 'Bob, Alice');
  assert.deepEqual(values, [' Bob ', ' Alice ']);
  assert.equal(composeNames(Object.freeze([])), '');
});

for (const [label, value] of [
  ['null', null], ['undefined', undefined], ['string', 'Alice'],
  ['number', 42], ['boolean', false], ['bigint', 1n],
  ['symbol', Symbol('Alice')], ['object', {}],
  ['array-like object', { 0: 'Alice', length: 1 }],
  ['iterable set', new Set(['Alice'])], ['function', () => ['Alice']],
]) {
  test(`C2: rejects non-array ${label} with TypeError`, () => {
    assert.throws(() => composeNames(value), TypeError);
  });
}

test('C2: rejects non-array before reading elements or iterator', () => {
  let reads = 0;
  const value = new Proxy({ 0: 'Alice', length: 1 }, {
    get() {
      reads += 1;
      throw new Error('Non-array must not be processed');
    },
  });
  assert.throws(() => composeNames(value), TypeError);
  assert.equal(reads, 0);
  assert.throws(() => composeNames(), TypeError);
});

for (const [label, value] of [
  ['empty string', ''], ['whitespace', ' \t\r\n'],
  ['Unicode whitespace', '\u00a0\u2003\uFEFF'],
  ['null', null], ['undefined', undefined], ['number', 42],
  ['boolean', false], ['bigint', 1n], ['symbol', Symbol('Alice')],
  ['object', {}], ['array', ['Alice']], ['boxed string', new String('Alice')],
]) {
  for (const position of ['first', 'later']) {
    test(`C2: rejects ${label} in ${position} position without changing input`, () => {
      const values = position === 'first' ? [value, ' Bob '] : [' Alice ', value, ' Bob '];
      const before = values.slice();
      assert.throws(() => normalize(value), TypeError);
      assert.throws(() => composeNames(values), TypeError);
      assert.deepEqual(values, before);
    });
  }
}

for (const [label, makeValues] of [
  ['only hole', () => new Array(1)],
  ['first hole', () => [, ' Bob ']],
  ['later hole', () => [' Alice ', , ' Bob ']],
]) {
  test(`C2: sparse array ${label} throws instead of returning partial output`, () => {
    const values = makeValues();
    const before = values.slice();
    assert.throws(() => composeNames(values), TypeError);
    assert.deepEqual(values, before);
  });
}

test('C2: invalid item in a frozen array propagates TypeError', () => {
  const values = Object.freeze([' Alice ', null]);
  assert.throws(() => composeNames(values), TypeError);
  assert.deepEqual(values, [' Alice ', null]);
});

test('C2: reads values in order and stops at the first invalid item', () => {
  const reads = [];
  const values = [];
  for (const [index, value] of [' Alice ', null, ' Bob '].entries()) {
    Object.defineProperty(values, index, {
      enumerable: true,
      configurable: true,
      get() {
        reads.push(index);
        return value;
      },
    });
  }
  assert.throws(() => composeNames(values), TypeError);
  assert.deepEqual(reads, [0, 1]);
});
