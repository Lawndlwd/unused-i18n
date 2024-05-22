import * as fs from 'fs'
import * as path from 'path'
import { Config } from '../types/config'

export const loadConfig = (): Config => {
  const configPath = path.resolve(
    process.cwd(),
    'translation-cleaner.config.json'
  )
  if (!fs.existsSync(configPath)) {
    throw new Error(
      'Configuration file translation-cleaner.config.json not found.'
    )
  }

  const configContent = fs.readFileSync(configPath, 'utf-8')
  return JSON.parse(configContent)
}
