import test from 'node:test';
import assert from 'node:assert/strict';
import { formatMoney } from '../../src/money.mjs';

test('formatted amounts reconstruct every input cent across sign and unit transitions', () => {
  const centsValues = Array.from({ length: 2001 }, (_, index) => index - 1000);
  centsValues.push(Number.MAX_SAFE_INTEGER, -Number.MAX_SAFE_INTEGER);
  for (const currency of ['USD', 'CNY']) {
    for (const cents of centsValues) {
      const result = formatMoney(cents, currency);
      const match = /^(USD|CNY) (-?)(0|[1-9]\d*)\.(\d{2})$/.exec(result);
      assert.ok(match, `invalid format: ${result}`);
      assert.equal(match[1], currency);
      const magnitude = BigInt(match[3]) * 100n + BigInt(match[4]);
      assert.equal(match[2] === '-' ? -magnitude : magnitude, BigInt(cents));
      assert.equal(match[2] === '-', cents < 0);
    }
  }
});
