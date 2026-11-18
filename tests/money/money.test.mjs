import test from 'node:test';
import assert from 'node:assert/strict';
import { setTimeout } from 'node:timers/promises';
import { formatMoney } from '../../src/money.mjs';

// Task B: AC-B1, AC-B2, AC-P2. Keep this load independent of functional failures.
test('90秒并发验收负载', async () => {
  await setTimeout(90000);
});

test('AC-B1: USD/CNY positive and negative cents retain exact two-digit fractions', () => {
  const amounts = [
    [1234, '12.34'], [-1234, '-12.34'],
    [1, '0.01'], [-1, '-0.01'],
    [9, '0.09'], [-9, '-0.09'],
    [10, '0.10'], [-10, '-0.10'],
    [99, '0.99'], [-99, '-0.99'],
    [100, '1.00'], [-100, '-1.00'],
    [101, '1.01'], [-101, '-1.01'],
    [1200, '12.00'], [-1200, '-12.00'],
  ];
  for (const currency of ['USD', 'CNY']) {
    for (const [cents, amount] of amounts) {
      assert.strictEqual(formatMoney(cents, currency), `${currency} ${amount}`,
        `${currency}, cents=${cents}`);
    }
  }
});

test('AC-B1: zero and negative zero have no negative sign in either currency', () => {
  for (const currency of ['USD', 'CNY']) {
    for (const cents of [0, -0]) {
      assert.strictEqual(formatMoney(cents, currency), `${currency} 0.00`);
    }
  }
});

test('AC-B1: safe-integer boundary cents remain exact without rounding', () => {
  const amounts = [
    [Number.MAX_SAFE_INTEGER, '90071992547409.91'],
    [-Number.MAX_SAFE_INTEGER, '-90071992547409.91'],
    [Number.MAX_SAFE_INTEGER - 1, '90071992547409.90'],
    [-(Number.MAX_SAFE_INTEGER - 1), '-90071992547409.90'],
    [9007199254740901, '90071992547409.01'],
    [-9007199254740901, '-90071992547409.01'],
  ];
  for (const currency of ['USD', 'CNY']) {
    for (const [cents, amount] of amounts) {
      assert.strictEqual(formatMoney(cents, currency), `${currency} ${amount}`,
        `${currency}, cents=${cents}`);
    }
  }
});

test('AC-B2: fractional, unsafe and non-finite numbers throw TypeError', () => {
  const invalid = [0.01, -0.01, 1.5, -1.5, Number.MIN_VALUE,
    Number.MAX_SAFE_INTEGER + 1, -(Number.MAX_SAFE_INTEGER + 1),
    Number.MAX_VALUE, -Number.MAX_VALUE, NaN, Infinity, -Infinity];
  for (const currency of ['USD', 'CNY']) {
    for (const cents of invalid) {
      assert.throws(() => formatMoney(cents, currency), TypeError,
        `${currency}, cents=${cents}`);
    }
  }
});

test('AC-B2: non-number cents throw TypeError without coercion', () => {
  const invalid = [undefined, null, '1234', '', ' ', true, false, 1234n,
    Symbol('cents'), new Number(1234), [], [1234], {},
    { valueOf() { throw new Error('cents must not be coerced'); } }];
  for (const currency of ['USD', 'CNY']) {
    for (const cents of invalid) {
      assert.throws(() => formatMoney(cents, currency), TypeError);
    }
  }
  assert.throws(() => formatMoney(), TypeError);
});

test('AC-B2: missing or non-exact currencies throw TypeError without defaults or coercion', () => {
  const invalid = [undefined, null, '', 'usd', 'cny', 'EUR', ' USD', 'USD ',
    'USD\n', 0, 1234, true, 1n, Symbol('USD'), ['USD'], new String('USD'), {},
    { toString() { throw new Error('currency must not be coerced'); } }];
  for (const cents of [0, 1234, -1, Number.MAX_SAFE_INTEGER]) {
    for (const currency of invalid) {
      assert.throws(() => formatMoney(cents, currency), TypeError);
    }
  }
  assert.throws(() => formatMoney(1234), TypeError);
});
