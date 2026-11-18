import { normalize } from './normalize.mjs';

/** Join normalized names without changing the input; invalid values throw TypeError. */
export function composeNames(values) {
  if (!Array.isArray(values)) {
    throw new TypeError('Expected an array');
  }

  const names = [];
  for (const value of values) {
    names.push(normalize(value));
  }
  return names.join(', ');
}
