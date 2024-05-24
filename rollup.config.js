import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import typescript from '@rollup/plugin-typescript'
import json from '@rollup/plugin-json'

export default [
  {
    input: 'src/index.ts',
    output: [
      {
        file: 'dist/index.js',
        format: 'es',
      },
      {
        file: 'dist/index.cjs',
        format: 'cjs',
      },
    ],
    plugins: [resolve(), commonjs(), typescript(), json()],
  },
  {
    input: 'src/cli.ts',
    output: [
      {
        file: 'dist/cli.cjs',
        format: 'cjs',
        banner: '#!/usr/bin/env node',
      },
      {
        file: 'dist/cli.mjs',
        format: 'es',
        banner: '#!/usr/bin/env node',
      },
    ],
    plugins: [resolve(), commonjs(), typescript(), json()],
  },
]
