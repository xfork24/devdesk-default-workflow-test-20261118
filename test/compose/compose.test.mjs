import test from 'node:test';
import assert from 'node:assert/strict';
import { composeNames } from '../../src/compose.mjs';
import { normalize } from '../../src/normalize.mjs';

test('compose uses real normalization across calls without retaining failed results', () => {
  const values = Object.freeze([' \tAlice\n', ' AlIce  van\tDYKE ']);
  assert.equal(composeNames(values), values.map(normalize).join(', '));
  assert.throws(() => composeNames([' Alice ', null]), TypeError);
  assert.equal(composeNames([' Bob ']), normalize(' Bob '));
  assert.equal(composeNames([]), '');
});

test('an element access failure propagates unchanged and prevents later reads', () => {
  const failure = new Error('Caller element is unavailable');
  let laterReads = 0;
  const values = [' Alice '];
  Object.defineProperty(values, 1, { get() { throw failure; } });
  Object.defineProperty(values, 2, { get() { laterReads += 1; return ' Bob '; } });
  assert.throws(() => composeNames(values), error => error === failure);
  assert.equal(laterReads, 0);
  assert.equal(values[0], ' Alice ');
});
