import * as fs from 'fs'
import { loadConfig } from './utils/loadConfig'
import { searchFilesWithPattern } from './core/search'
import { extractTranslations } from './core/extract'
import { removeLocaleKeys } from './core/remove'
import c from 'ansi-colors'
import { getMissingTranslations } from './utils/missingTranslations'
import createBox from './utils/boxen'

export const processTranslations = () => {
  const config = loadConfig()
  const excludePatterns = [/\.test\./, /__mock__/]
  const localesExtensions = config.localesExtensions ?? 'js'
  const localesNames = config.localesNames ?? 'en'

  let totalUnusedLocales = 0
  const unusedLocalesCountByPath: {
    path: string
    messages?: string
    warning?: string
  }[] = []

  config.paths.forEach(({ srcPath, localPath }) => {
    let allExtractedTranslations: string[] = []
    let pathUnusedLocalesCount = 0

    srcPath.forEach((pathEntry) => {
      if (config.ignorePaths && config.ignorePaths.includes(pathEntry)) return
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
      console.log(`${localeFilePath}...`)

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

      pathUnusedLocalesCount = missingTranslations.length
      totalUnusedLocales += pathUnusedLocalesCount

      const formattedMissingTranslations = missingTranslations
        .map((translation) => c.red(`  ${translation}`))
        .join('\n')

      const message = missingTranslations.length
        ? `Missing translations for ${c.yellow(localeFilePath)}: ${c.red(
            `${pathUnusedLocalesCount}`
          )}   \n${formattedMissingTranslations}`
        : c.green(`No missing translations for ${c.yellow(localeFilePath)}`)
      unusedLocalesCountByPath.push({
        path: localPath,
        messages: message,
      })

      // Remove the unused locale keys
      removeLocaleKeys(localeFilePath, missingTranslations)
    } else {
      const warningMessage = c.red(`Locale file not found: ${localeFilePath}`)

      unusedLocalesCountByPath.push({
        path: localPath,
        warning: warningMessage,
      })
    }
  })

  // Log total unused locales and unused locales by path

  unusedLocalesCountByPath.forEach(({ messages, warning }) => {
    console.log(createBox(messages ?? ''))
    if (warning) {
      console.log(createBox(warning ?? ''))
    }
  })

  console.log(
    createBox(`Total unused locales: ${c.yellow(`${totalUnusedLocales}`)}`)
  )
}
