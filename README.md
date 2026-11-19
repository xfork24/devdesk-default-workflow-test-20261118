# devdesk-default-workflow-test-20261118
Dedicated DevDesk default workflow simplification acceptance, 2026-11-18

## ASCII slug

```js
import { slugify } from './src/baseline-slug.mjs';

slugify('  Hello, World!  '); // 'hello-world'
slugify(' A----B___C '); // 'a-b-c'
slugify('Already-OK42'); // 'already-ok42'
slugify('中文'); // ''
```

`slugify(value)` synchronously trims and lowercases a primitive string, replaces
each run outside ASCII `a-z0-9` with `-`, and removes edge hyphens. It performs no
Unicode transliteration. Empty strings and inputs without surviving ASCII letters
or digits return `''`. Non-string values (including wrapped strings) throw
`TypeError` without implicit conversion.
