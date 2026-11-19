import { test } from 'node:test';
import assert from 'node:assert/strict';
import { identity } from '../src/existing.mjs';
test('existing identity preserves its input', () => { const value = {}; assert.equal(identity(value), value); });
