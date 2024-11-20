import * as fs from 'fs'
import * as path from 'path'
import { Config } from '../types'
import { build } from 'esbuild'

const supportedExtensions = ['.json', '.js', '.cjs', '.ts']

export const loadConfig = async (): Promise<Config> => {
  const cwd = process.cwd()
  let configPath = ''

  for (const ext of supportedExtensions) {
    const potentialPath = path.resolve(cwd, `unused-i18n.config${ext}`)
    if (fs.existsSync(potentialPath)) {
      configPath = potentialPath
      break
    }
  }

  if (!configPath) {
    throw new Error(
      'Configuration file unused-i18n.config not found. Supported extensions: .json, .js, .cjs, .ts.',
    )
  }

  const extension = path.extname(configPath)

  if (extension === '.json') {
    const configContent = fs.readFileSync(configPath, 'utf-8')
    return JSON.parse(configContent) as Config
  } else if (extension === '.ts') {
    const result = await build({
      entryPoints: [configPath],
      outfile: 'config.js',
      platform: 'node',
      format: 'esm',
      bundle: true,
      write: false,
    })

    const jsCode = result.outputFiles[0].text

    const module = await import(
      'data:application/javascript,' + encodeURIComponent(jsCode)
    )
    return module.default as Config
  } else {
    const module = await import(configPath)
    return module.default as Config
  }
}
