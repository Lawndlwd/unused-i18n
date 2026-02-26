# Unused i18n

Simplifies managing and cleaning up unused translation keys in localization files

## Features

- Analyzes source files to identify used and unused translation keys.
- Supports multiple scoped translation functions.
- Can display or remove unused translation keys.
- Configurable through a JSON, CJS, JS, or TS config file.
- Supports glob patterns for excluding keys.
- Custom extraction patterns for non-standard translation functions.
- Configurable file search patterns.

## Installation

You can install `unused-i18n` via npm:

```sh
npm install -g unused-i18n

or

npm install -D unused-i18n
```

## Configuration

Create a `unused-i18n.config.json`, `unused-i18n.config.js`, `unused-i18n.config.cjs`, or `unused-i18n.config.ts` file in the root of your project. Here's an example configuration:

```cjs
module.exports = {
  paths: [
    {
      srcPath: ['src/pages/products'],
      localPath: 'src/pages/products/locales',
    },
  ],
  localesExtensions: 'ts',
  localesNames: 'en',
  scopedNames: ['scopedT', 'scopedTOne'],
  ignorePaths: ['src/pages/products/ignoreThisFolder'],
  excludeKey: ['someKey', 'headTitle.*'],
  prefixKeys: ['headTitle'],
  customPatterns: ['useProductHeadTitle\\([\'"]([^\'"]+)[\'"]'],
  filePatterns: ['use-i18n', 'namespaceTranslation'],
}
```

| Option              | Type             | Default          | Required | Description                                                                                               |
| ------------------- | ---------------- | ---------------- | -------- | --------------------------------------------------------------------------------------------------------- |
| `paths`             | Array of Objects | `[]`             | Yes      | An array of objects defining the source paths and local paths to be checked.                              |
| `paths.srcPath`     | Array of Strings | `[]`             | Yes      | Source paths to search for translations.                                                                  |
| `paths.localPath`   | String           | `""`             | Yes      | Path to the translation files.                                                                            |
| `localesExtensions` | String           | `"js"`           | No       | Extension of the locale files.                                                                            |
| `localesNames`      | String           | `"en"`           | No       | Name of the locale files without the extension.                                                           |
| `scopedNames`       | Array of Strings | `[]`             | No       | Names of the scoped translation functions used in your project.                                           |
| `ignorePaths`       | Array of Strings | `[]`             | No       | Paths to be ignored during the search.                                                                    |
| `excludeKey`        | String or Array  | `[]`             | No       | Keys to exclude from unused detection. Supports glob patterns (e.g. `headTitle.*` matches `headTitle.foo`). |
| `prefixKeys`        | Array of Strings | `[]`             | No       | Key prefixes to treat as always used (e.g. `['headTitle']` marks `headTitle.clusters` as used).           |
| `customPatterns`    | Array of Strings | `[]`             | No       | Additional regex patterns to extract translation keys from source. Must have one capture group for the key. |
| `filePatterns`      | Array of Strings | `["use-i18n"]`   | No       | File content patterns to determine which files to scan. A file is scanned if it matches any pattern.      |

### `excludeKey` glob patterns

The `excludeKey` option now supports glob-style patterns:

- `"someKey"` — exact match only
- `"headTitle.*"` — matches any key starting with `headTitle.` (e.g. `headTitle.foo`, `headTitle.foo.bar`)

### `customPatterns`

Use `customPatterns` when you have custom helper functions that accept translation keys. Each pattern is a regex string with one capture group that extracts the key:

```js
// This pattern extracts keys from: useProductHeadTitle('some.key')
customPatterns: ['useProductHeadTitle\\([\'"]([^\'"]+)[\'"]']
```

### `filePatterns`

By default, only files containing `use-i18n` are scanned. If you have files that define key maps or use custom helpers without importing `use-i18n`, add patterns to include them:

```js
filePatterns: ['use-i18n', 'namespaceTranslation', 'useProductHeadTitle']
```

## Usage

### Using with Config File

To use unused-i18n with your config file, simply run:

```sh
npx unused-i18n display
```

### Using with Command Line Options

You can also specify the source and local paths directly in the command line:

##### Display Unused Translations

```sh
npx unused-i18n display --srcPath="src/folders/bla" --localPath="src/folders/bla/locales"
```

##### Remove Unused Translations

```sh
npx unused-i18n remove --srcPath="src/folders/bla" --localPath="src/folders/bla/locales"
```

## API

`processTranslations({ paths, action })`

Processes translations based on the specified paths and action. Returns a `Promise<number>` with the count of unused translations found.

- `paths`: Optional array of objects containing `srcPath` and `localPath`. Falls back to config file paths.
- `action`: Action to perform, either `'display'` or `'remove'`.

```ts
import { processTranslations } from 'unused-i18n'

const unusedCount = await processTranslations({ action: 'display' })
if (unusedCount > 0) {
  process.exit(1)
}
```

## Development

### Building the Project

To build the project, run:

```sh
pnpm run build
```

#### Running Tests

To run the tests, use:

```sh
pnpm run test
```

## License

This project is licensed under the MIT License - see the [LICENSE](https://github.com/Lawndlwd/unused-i18n/blob/HEAD/LICENSE) file for details.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request if you have any improvements or suggestions.

Acknowledgements

- [Vite](https://vitejs.dev/) - Next Generation Frontend Tooling.
- [TypeScript](https://www.typescriptlang.org/) - Typed JavaScript used in this project.
- [Vitest](https://vitest.dev/guide/cli) - Testing framework used in this project.
- [Commander](https://github.com/tj/commander.js#readme) - Node.js command-line interfaces.
