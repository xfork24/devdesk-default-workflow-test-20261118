export function slugify(value) {
  if (typeof value !== 'string') {
    throw new TypeError('Expected a string');
  }

  const trimmed = value.trim();
  if (trimmed.length === 0) {
    throw new TypeError('Expected a non-empty string');
  }

  return trimmed.replace(/\s+/g, '-').toLowerCase();
}
