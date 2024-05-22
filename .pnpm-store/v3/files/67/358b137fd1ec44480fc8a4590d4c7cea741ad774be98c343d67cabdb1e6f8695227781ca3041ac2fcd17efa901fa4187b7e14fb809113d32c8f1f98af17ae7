import * as fs from 'node:fs';
import * as path from 'node:path';
import tsc from 'typescript';
export const transpile = async (options) => {
    const ts = await fs.promises.readFile(options.tsPath);
    const tsTranspiled = tsc.transpileModule(ts.toString(), options.transpileOptions);
    await fs.promises.mkdir(path.dirname(options.jsPath), {
        recursive: true,
    });
    await fs.promises.writeFile(options.jsPath, tsTranspiled.outputText);
};
export const transpileSync = (options) => {
    const ts = fs.readFileSync(options.tsPath);
    const tsTranspiled = tsc.transpileModule(ts.toString(), options.transpileOptions);
    fs.mkdirSync(path.dirname(options.jsPath), {
        recursive: true,
    });
    fs.writeFileSync(options.jsPath, tsTranspiled.outputText);
};
//# sourceMappingURL=transpile.js.map