export function slugify(value) {
  if (typeof value !== 'string') {
    throw new TypeError('slugify expects a string');
  }

  return value.trim().toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
