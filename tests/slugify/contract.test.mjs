import test from 'node:test';
import assert from 'node:assert/strict';
import * as api from '../../src/slugify.mjs';

test('SLUG-01: named synchronous function returns a primitive string', () => {
  assert.equal(typeof api.slugify, 'function');
  const result = api.slugify('Example');
  assert.equal(typeof result, 'string');
  assert.equal(result, 'example');
});

test('SLUG-02: four required examples', async (t) => {
  const examples = [
    [' Hello World ', 'hello-world'],
    ['A\t B\nC', 'a-b-c'],
    ['already-slug', 'already-slug'],
    ['ZERO 0', 'zero-0'],
  ];
  for (const [input, expected] of examples) {
    await t.test(JSON.stringify(input), () => {
      assert.equal(api.slugify(input), expected);
    });
  }
});

test('SLUG-03: preserve punctuation, underscores and existing hyphens', async (t) => {
  const examples = [
    [' --A_B!  C-- ', '--a_b!-c--'],
    ['A--B', 'a--b'],
    ['A- -B', 'a---b'],
    ['---', '---'],
    ['!', '!'],
    [' A.B/C?D&E+F:G@H#I ', 'a.b/c?d&e+f:g@h#i'],
  ];
  for (const [input, expected] of examples) {
    await t.test(JSON.stringify(input), () => {
      assert.equal(api.slugify(input), expected);
    });
  }
});

test('SLUG-04: standard whitespace and Unicode lowercasing without normalization', async (t) => {
  const examples = [
    ['\t\r\n A\t\tB\r\nC\v\fD \n', 'a-b-c-d'],
    ['\u00a0\uFEFF A\u2003\u2028\u2029B\u3000', 'a-b'],
    [' ÉCOLE  ÄÖ Ü ', 'école-äö-ü'],
    [' E\u0301  É ', 'e\u0301-é'],
    [' A\u200bB ', 'a\u200bb'],
  ];
  for (const [input, expected] of examples) {
    await t.test(JSON.stringify(input), () => {
      assert.equal(api.slugify(input), expected);
    });
  }
});

test('SLUG-05: empty and whitespace-only strings synchronously throw TypeError', async (t) => {
  for (const input of ['', ' ', '\t\r\n\v\f', '\u00a0\u2003\u2028\u2029\u3000\uFEFF']) {
    await t.test(JSON.stringify(input), () => {
      assert.throws(() => api.slugify(input), TypeError);
    });
  }
});

test('SLUG-06: reject every non-string category and omitted argument', async (t) => {
  const examples = [
    ['null', null], ['undefined', undefined],
    ['zero', 0], ['nonzero number', 12], ['NaN', NaN], ['Infinity', Infinity],
    ['false', false], ['true', true],
    ['object', {}], ['empty array', []], ['string array', ['A']],
    ['function', () => 'A'], ['symbol', Symbol('A')], ['bigint', 1n],
    ['boxed string', new String('A')],
  ];
  for (const [label, input] of examples) {
    await t.test(label, () => {
      assert.throws(() => api.slugify(input), TypeError);
    });
  }
  await t.test('omitted argument', () => {
    assert.throws(() => api.slugify(), TypeError);
  });
});

test('SLUG-07: reject objects before touching conversion hooks', async (t) => {
  for (const hook of [Symbol.toPrimitive, 'toString', 'valueOf']) {
    await t.test(String(hook), () => {
      let accesses = 0;
      let calls = 0;
      const input = Object.create(null);
      Object.defineProperty(input, hook, {
        get() {
          accesses += 1;
          return () => { calls += 1; return 'Hello'; };
        },
      });
      assert.throws(() => api.slugify(input), TypeError);
      assert.equal(accesses, 0);
      assert.equal(calls, 0);
    });
  }
});

test('SLUG-08: deterministic calls and recovery after failures', () => {
  const input = ' Keep  ME! ';
  assert.equal(api.slugify(input), 'keep-me!');
  assert.equal(api.slugify(input), 'keep-me!');
  assert.throws(() => api.slugify(null), TypeError);
  assert.equal(api.slugify(' Next Value '), 'next-value');
  assert.throws(() => api.slugify(' \t '), TypeError);
  assert.equal(api.slugify(input), 'keep-me!');
  assert.equal(input, ' Keep  ME! ');
});
