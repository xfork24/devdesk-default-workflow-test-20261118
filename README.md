# devdesk-default-workflow-test-20261118
Dedicated DevDesk default workflow simplification acceptance, 2026-11-18

## ASCII slug

```js
import { slugify } from './src/baseline-slug.mjs';

slugify('  Hello, World!  '); // 'hello-world'
slugify(' A----B___C '); // 'a-b-c'
slugify('中文'); // ''
```

`slugify(value)` accepts primitive strings and throws `TypeError` for all other
values. It trims and lowercases the string, replaces each run outside ASCII
`a-z` and `0-9` with a hyphen, and removes leading and trailing hyphens. Empty
results return `''`; Unicode characters are not transliterated.

Run the project tests with `npm test`.
