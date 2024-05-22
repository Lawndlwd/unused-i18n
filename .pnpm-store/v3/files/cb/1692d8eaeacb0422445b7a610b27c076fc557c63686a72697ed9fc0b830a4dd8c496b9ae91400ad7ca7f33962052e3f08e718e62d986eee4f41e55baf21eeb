<p align="center">
    <h1>ts-options-defaults</h1>
    <div>Options-defaults design pattern implementation for reliable configuration. It merges objects deeply, overrides arrays and classes (different than Object) and the result remains strongly typed.</div>
</p>

## Table of contents

1. [Getting Started](#getting-started)

2. [Usage](#usage)

3. [Features](#features)

## Getting Started

`npm i ts-options-defaults`

## Usage

### Design pattern

```ts
import { defaults } from 'ts-options-defaults';

export interface ISomeOptions {
    logger?: Partial<Console>;
}

export class Something {
    static defaults = {
        logger: console,
    };

    options: ISomeOptions & typeof Something.defaults;
    constructor(options?: ISomeOptions) {
        this.options = defaults(Rat.defaults, options);
    }
}
```

### Behavior

```ts
import { defaults } from 'ts-options-defaults';

class TestLogger {
    constructor(public name = `TestLogger`) {}

    log() {
        console.log(`Call from ${this.name}`);
    }
}

const someDefaults = {
    console,
    nested: {
        property: 'default',
        shouldBeDefault: 'default',
        array: ['default1', 'default2'],
    },
};

const someOptions = {
    nested: {
        property: 'overriden',
        array: ['overriden1'],
    },
    array: ['overriden'],
};

const options = defaults(
    someDefaults,
    someOptions,
    {
        console: {
            log: () => {
                console.log(`TEST`);
            },
        },
    },
    {
        console: new TestLogger(),
    },
);

options.console.log(`log`); // "Call from TestLogger"
options.console.debug(`debug`); // "debug"

// options will be:
{
    "nested": {
        "property": "overriden",
        "shouldBeDefault": "default",
        "array": [
            "overriden1"
        ]
    },
    "array": [
        "overriden"
    ]
}

// someDefaults will not be mutated!
```

## Features

**Beats alternatives** - better alternative to `{...defaults, ...options}` destructing and lodash `_.defaults` or `_.merge`
**Secure** - immune to prototype pollution attack
**Simple** - just 40 lines of clean TypeScript code
**Strongly typed** - result remains strongly typed
