import * as tsc from 'typescript';
type RecursivePartial<T> = {
    [P in keyof T]?: T[P] extends (infer U)[] ? RecursivePartial<U>[] : T[P] extends object ? RecursivePartial<T[P]> : T[P];
};
export declare enum LoadMode {
    Transpile = "transpile",
    Compile = "compile"
}
export interface LoadTranspileOptions {
    mode: LoadMode.Transpile;
    allowConfigurationWithComments?: boolean;
    compiledJsExtension?: string;
    useCache?: boolean;
    transpileOptions: {
        cache: {
            dir: string;
        };
        transpileOptions: tsc.TranspileOptions;
    };
}
export interface LoadCompileOptions {
    mode: LoadMode.Compile;
    allowConfigurationWithComments?: boolean;
    compiledJsExtension?: string;
    useCache?: boolean;
    compileOptions: {
        compilerOptions: tsc.CompilerOptions;
    };
}
export type LoadOptions = RecursivePartial<LoadCompileOptions | LoadTranspileOptions>;
export {};
