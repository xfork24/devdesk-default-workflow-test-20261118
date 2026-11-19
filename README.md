# devdesk-default-workflow-test-20261118
Dedicated DevDesk default workflow simplification acceptance, 2026-11-18

## ASCII slug

```js
import { slugify } from './src/baseline-slug.mjs';

slugify('  Hello, World!  '); // 'hello-world'
```

`slugify(value)` trims and lowercases a string, replaces each run outside ASCII
`a-z` and `0-9` with one hyphen, then removes leading and trailing hyphens.
Empty strings and strings with no ASCII letters or digits return `''`.
There is no Unicode transliteration. Non-string inputs throw `TypeError`.

Run the project tests with `npm test`.
