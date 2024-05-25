# Translation Cleaner

`unused-i18n` is a tool designed to help developers manage and clean up unused translation keys in their localization files. This utility ensures that your translation files remain clean and free from unused keys, making your localization process more efficient.

## Features

- Analyzes source files to identify used and unused translation keys.
- Supports multiple scoped translation functions.
- Can display or remove unused translation keys.
- Configurable through a JSON, JS, or TS config file.

## Installation

You can install `unused-i18n` via npm:

```sh
npm install -g unused-i18n

or

npm install -D unused-i18n
```

## Configuration

Create a unused-i18n.config.json, unused-i18n.config.js, or unused-i18n.config.ts file in the root of your project. Here's an example configuration:

```ts
import type { Config } from 'unused-i18n'

const config = {
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
  excludeKey: ['someKey'],
} satisfies Config

export default config
```

| Option              | Type             | Default | Required | Description                                                                  |
| ------------------- | ---------------- | ------- | -------- | ---------------------------------------------------------------------------- |
| `paths`             | Array of Objects | `[]`    | Yes      | An array of objects defining the source paths and local paths to be checked. |
| `paths.srcPath`     | Array of Strings | `[]`    | Yes      | Source paths to search for translations.                                     |
| `paths.localPath`   | Strings          | `""`    | Yes      | Path to the translation files.                                               |
| `localesExtensions` | String           | `js`    | No       | Extension of the locale files.                                               |
| `localesNames`      | String           | `en`    | No       | Name of the locale files without the extension.                              |
| `scopedNames`       | Array of Strings | `[]`    | No       | Names of the scoped translation functions used in your project.              |
| `ignorePaths`       | Array of Strings | `[]`    | No       | Paths to be ignored during the search.                                       |
| `excludeKey`        | Array of Strings | `[]`    | No       | Specific translation keys to be excluded from the removal process.           |

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

`processTranslations(paths, action)`
Processes translations based on the specified paths and action.

- paths: Array of objects containing srcPath and localPath.
- action: Action to perform, either 'display' or 'remove'.

## Development

### Building the Project

To build the project, run:

```sh
npm run build
```

#### Running Tests

To run the tests, use:

```sh
npm run test
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request if you have any improvements or suggestions.

Acknowledgements

- [Rollup](https://rollupjs.org/) - Module bundler used in this project.
- [TypeScript](https://www.typescriptlang.org/) - Typed JavaScript used in this project.
- [Vitest](https://vitest.dev/guide/cli) - Testing framework used in this project.
