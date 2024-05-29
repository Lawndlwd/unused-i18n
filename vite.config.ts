import { defineConfig } from 'vite'
import type { UserConfig } from 'vitest/config'

const external = (id: string) => {
  if (
    id.endsWith('fs') ||
    id.endsWith('path') ||
    id.endsWith('perf_hooks') ||
    id.endsWith('process') ||
    id.endsWith('commander')
  ) {
    return true
  }

  false
}
export const defaultConfig: UserConfig = {
  build: {
    outDir: 'dist',
    lib: {
      name: 'unused-i18n',
      entry: 'src/cli.ts',

      formats: ['cjs'],
      fileName: (format, filename) => `${filename}.${format}`,
    },
    rollupOptions: {
      external,
      preserveSymlinks: true,
      input: 'src/cli.ts',
      output: {
        banner: '#!/usr/bin/env node',
        interop: 'compat',
        manualChunks: {},
      },
    },
  },
  plugins: [],
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'json', 'html'],
    },
  },
}

export default defineConfig(defaultConfig)
