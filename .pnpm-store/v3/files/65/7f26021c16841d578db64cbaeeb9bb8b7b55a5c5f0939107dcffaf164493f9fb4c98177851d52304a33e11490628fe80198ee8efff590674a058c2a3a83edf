import tsc from 'typescript';
export const compile = (options) => {
    const program = tsc.createProgram({
        rootNames: [options.tsPath],
        options: options.compilerOptions,
    });
    program.emit();
};
//# sourceMappingURL=compile.js.map