# devdesk-default-workflow-test-20261118
Dedicated DevDesk default workflow simplification acceptance, 2026-11-18

## ASCII slug

```js
import { slugify } from './src/baseline-slug.mjs';

slugify('  Hello, World!  '); // 'hello-world'
```

`slugify` accepts primitive strings and synchronously throws `TypeError` for
other values. It applies JavaScript `trim()` and `toLowerCase()`, replaces each
run outside ASCII `[a-z0-9]` with one hyphen, then removes leading and trailing
hyphens. It performs no Unicode normalization or transliteration; inputs with
no remaining ASCII letters or digits return `''`.
