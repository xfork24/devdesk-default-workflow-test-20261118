/** Format safe integer cents in USD or CNY without rounding or coercion.
 * @throws {TypeError} If cents or currency is invalid.
 */
export function formatMoney(cents, currency) {
  if (!Number.isSafeInteger(cents)) {
    throw new TypeError('cents must be a safe integer');
  }
  if (currency !== 'USD' && currency !== 'CNY') {
    throw new TypeError('currency must be USD or CNY');
  }

  const integerCents = BigInt(cents);
  const magnitude = integerCents < 0n ? -integerCents : integerCents;
  const units = magnitude / 100n;
  const fraction = String(magnitude % 100n).padStart(2, '0');
  const sign = cents < 0 ? '-' : '';
  return `${currency} ${sign}${units}.${fraction}`;
}
