import * as fs from 'fs'
import * as path from 'path'
import { Config } from '../types/config'

const supportedExtensions = ['.json', '.js', '.ts', '.cjs']

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
      'Configuration file unused-i18n.config not found. Supported extensions: .json, .js, .ts, .cjs.'
    )
  }

  const extension = path.extname(configPath)

  if (extension === '.json') {
    const configContent = fs.readFileSync(configPath, 'utf-8')
    return JSON.parse(configContent) as Config
  } else {
    const module = await import(configPath)
    return module.default as Config
  }
}
