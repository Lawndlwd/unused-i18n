### Design pattern

```ts
import { defaults } from 'options-defaults';

export interface SomeOptions {
    logger?: Partial<Console>;
}

export class Something {
    static defaults = {
        logger: console,
    };

    options: SomeOptions & typeof Something.defaults;
    constructor(options?: SomeOptions) {
        this.options = defaults(Something.defaults, options);
    }
}
```

### Behavior

```ts
import { defaults } from 'options-defaults';

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
