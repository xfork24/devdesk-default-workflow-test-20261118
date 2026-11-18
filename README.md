# devdesk-default-workflow-test-20261118
Dedicated DevDesk default workflow simplification acceptance, 2026-11-18

## slugify

Import the synchronous ESM function directly:

```js
import { slugify } from './src/slugify.mjs';

slugify(' Hello World '); // 'hello-world'
slugify('A\t B\nC'); // 'a-b-c'
```

`slugify(value)` accepts a primitive string that is non-empty after trimming.
It trims surrounding whitespace, replaces each internal run of JavaScript
whitespace with `-`, and applies standard lowercase conversion. Punctuation,
underscores and existing hyphens are preserved; no Unicode normalization or
transliteration is performed. Empty or whitespace-only strings and all
non-string values (including boxed strings) synchronously throw `TypeError`
without coercion.

With Node 24, run all tests using `node --test`. Independent contract tests live
in `tests/slugify/`; developer smoke tests live in `test/slugify/`.
