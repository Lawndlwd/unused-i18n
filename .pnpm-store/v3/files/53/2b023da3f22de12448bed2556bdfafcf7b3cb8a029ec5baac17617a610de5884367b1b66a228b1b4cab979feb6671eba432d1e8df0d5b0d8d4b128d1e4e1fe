import * as path from 'node:path';
import { defaults } from 'options-defaults';
import tsc from 'typescript';
export const getConfig = (options) => {
    const cwd = process.cwd();
    const defaultTranspileOptions = {
        cache: {
            dir: path.join(cwd, `.cache`, `ts-import`),
        },
        transpileOptions: {
            compilerOptions: {
                module: tsc.ModuleKind.ES2020,
                moduleResolution: tsc.ModuleResolutionKind.Node16,
                target: tsc.ScriptTarget.ES2020,
            },
        },
    };
    if (process.platform === `win32`) {
        const driveLetter = cwd.charAt(0);
        defaultTranspileOptions.cache.dir = path.join(defaultTranspileOptions.cache.dir, driveLetter);
    }
    const transpileOptions = defaults(defaultTranspileOptions, options.transpileOptions);
    return transpileOptions;
};
//# sourceMappingURL=get-config.js.map