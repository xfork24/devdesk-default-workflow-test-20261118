# devdesk-default-workflow-test-20261118
Dedicated DevDesk default workflow simplification acceptance, 2026-11-18

## ASCII slug

```js
import { slugify } from './src/baseline-slug.mjs';

slugify('  Hello, World!  '); // 'hello-world'
slugify(' A----B___C '); // 'a-b-c'
slugify('Already-OK42'); // 'already-ok42'
```

`slugify(value)` accepts primitive strings and throws `TypeError` for other
types (including `42`, `null` and `undefined`). It applies JavaScript `trim()`
and `toLowerCase()`, replaces each run outside ASCII `[a-z0-9]` with `-`,
then removes leading and trailing hyphens. It performs no Unicode
transliteration; `''`, `'___'` and `'中文'` return `''`.

Run the formal project tests with `npm test`; slug tests live in
`test/baseline-slug/slugify.test.mjs`.
