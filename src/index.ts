import * as fs from 'fs'
import { loadConfig } from './utils/loadConfig'
import { searchFilesWithPattern } from './core/search'
import { extractTranslations } from './core/extract'
import { removeLocaleKeys } from './core/remove'
import chalk from 'chalk'
import boxen from 'boxen'
import { getMissingTranslations } from './utils/missingTranslations'

export const processTranslations = () => {
  const config = loadConfig()
  const excludePatterns = [/\.test\./, /__mock__/]
  const localesExtensions = config.localesExtensions ?? 'js'
  const localesNames = config.localesNames ?? 'en'
  config.paths.forEach(({ srcPath, localPath }) => {
    let allExtractedTranslations: string[] = []

    srcPath.forEach((pathEntry) => {
      if (config.ignorePaths && config.ignorePaths?.includes(pathEntry)) return
      const files = searchFilesWithPattern(
        pathEntry,
        /use-i18n/,
        excludePatterns
      )

      const extractedTranslations = files
        .flatMap((file) => extractTranslations(file, config.scopedNames))
        .sort()
        .filter((item, index, array) => array.indexOf(item) === index)

      allExtractedTranslations = [
        ...allExtractedTranslations,
        ...extractedTranslations,
      ]
    })

    allExtractedTranslations = [...new Set(allExtractedTranslations)].sort()

    const localeFilePath = `${localPath}/${localesNames}.${localesExtensions}`
    if (fs.existsSync(localeFilePath)) {
      const localLines = fs
        .readFileSync(localeFilePath, 'utf-8')
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.match(/'[^']*':/))
        .map((line) => line.match(/'([^']+)':/)?.[1] ?? '')
        .sort()

      const missingTranslations = getMissingTranslations(
        localLines,
        allExtractedTranslations,
        config.excludeKey
      )

      const formattedMissingTranslations = missingTranslations
        .map((translation) => chalk.red(`  ${translation}`))
        .join('\n')

      const message = missingTranslations.length
        ? `Missing translations for ${chalk.yellow(
            localeFilePath
          )}:\n${formattedMissingTranslations}`
        : chalk.green(
            `No missing translations for ${chalk.yellow(localeFilePath)}`
          )

      // Display the message in a box
      console.log(
        boxen(message, {
          padding: 1,
          margin: 1,
          borderStyle: 'double',
          borderColor: 'yellow',
        })
      )

      // Remove the unused locale keys
      removeLocaleKeys(localeFilePath, missingTranslations)
    } else {
      console.warn(chalk.red(`Locale file not found: ${localeFilePath}`))
    }
  })
}
