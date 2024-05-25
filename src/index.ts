import * as fs from 'fs'
import { loadConfig } from './utils/loadConfig'
import c from 'ansi-colors'
import { getMissingTranslations } from './utils/missingTranslations'
import { summary } from './utils/summary'
import { searchFilesRecursively } from './lib/search'
import { analyze } from './lib/analyze'
import { removeLocaleKeys } from './lib/remove'
import { ProcessTranslationsArgs } from './types/types'

export const processTranslations = async ({
  paths,
  action,
}: ProcessTranslationsArgs) => {
  const config = await loadConfig()
  const excludePatterns = [/\.test\./, /__mock__/]
  const localesExtensions = config.localesExtensions ?? 'js'
  const localesNames = config.localesNames ?? 'en'

  let totalUnusedLocales = 0
  const unusedLocalesCountByPath: {
    path: string
    messages?: string
    warning?: string
  }[] = []

  const pathsToProcess = paths || config.paths

  pathsToProcess.forEach(({ srcPath, localPath }) => {
    let allExtractedTranslations: string[] = []
    let pathUnusedLocalesCount = 0

    srcPath.forEach((pathEntry) => {
      if (config.ignorePaths && config.ignorePaths.includes(pathEntry)) return
      const files = searchFilesRecursively({
        excludePatterns,
        regex: /use-i18n/,
        baseDir: pathEntry,
      })

      const extractedTranslations = files
        .flatMap((file) =>
          analyze({
            filePath: file,
            scopedNames: config.scopedNames,
          })
        )
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

      const missingTranslations = getMissingTranslations({
        localLines,
        extractedTranslations: allExtractedTranslations,
        excludeKey: config.excludeKey,
      })

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
      action === 'remove'
        ? removeLocaleKeys({
            localePath: localeFilePath,
            missingTranslations: missingTranslations,
          })
        : null
    } else {
      const warningMessage = c.red(`Locale file not found: ${localeFilePath}`)

      unusedLocalesCountByPath.push({
        path: localPath,
        warning: warningMessage,
      })
    }
  })

  summary({ unusedLocalesCountByPath, totalUnusedLocales })
}
