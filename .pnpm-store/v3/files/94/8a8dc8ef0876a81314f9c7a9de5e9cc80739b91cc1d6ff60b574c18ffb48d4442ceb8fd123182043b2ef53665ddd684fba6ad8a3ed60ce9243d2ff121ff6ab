import * as compiler from '../modules/compiler/index.js';
import { LoadCompileOptions, LoadMode, LoadOptions, LoadTranspileOptions } from '../load.interfaces.js';
export interface Providers {
    getCacheDir: (options: LoadCompileOptions[`compileOptions`] | LoadTranspileOptions[`transpileOptions`]) => string;
    getConfig: (options: Partial<LoadOptions>) => LoadCompileOptions['compileOptions'] | LoadTranspileOptions['transpileOptions'];
    load: (options: compiler.CompileOptions | compiler.TranspileOptions) => Promise<void>;
}
export declare const providersMap: Record<LoadMode, Providers>;
