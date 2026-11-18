export function normalize(value) {
  if (typeof value !== 'string') {
    throw new TypeError('Expected a string');
  }

  const normalized = value.trim();
  if (normalized.length === 0) {
    throw new TypeError('Expected a non-empty string');
  }

  return normalized;
}
