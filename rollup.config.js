import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import typescript from '@rollup/plugin-typescript'
import json from '@rollup/plugin-json'
import dts from 'rollup-plugin-dts'
import filesize from 'rollup-plugin-filesize'

export default [
  {
    input: 'src/cli.ts',
    output: [
      {
        file: 'dist/index.cjs',
        format: 'cjs',
        banner: '#!/usr/bin/env node',
      },
    ],
    plugins: [resolve(), commonjs(), typescript(), json(), filesize()],
  },
  {
    input: './src/types/index.ts',
    output: [{ file: 'dist/index.d.ts', format: 'es' }],
    plugins: [dts()],
  },
]
