import * as fs from 'fs'
import * as path from 'path'
import { loadConfig } from '@utils/loadConfig'
import { getMissingTranslations } from '@utils/missingTranslations'
import { summary } from '@utils/summary'
import { searchFilesRecursively } from '@lib/search'
import { analyze } from '@lib/analyze'
import { removeLocaleKeys } from '@lib/remove'
import { ProcessTranslationsArgs } from './types'
import { performance } from 'perf_hooks'

export const processTranslations = async ({
  paths,
  action,
}: ProcessTranslationsArgs): Promise<number> => {
  const config = await loadConfig()
  const excludePatterns = [/\.test\./, /__mock__/]
  const localesExtensions = config.localesExtensions ?? 'js'
  const localesNames = config.localesNames ?? 'en'

  let totalUnusedLocales = 0
  const unusedLocalesCountByPath: {
    path: string
    messages?: string
  }[] = []

  const pathsToProcess = paths || config.paths

  if (!pathsToProcess?.length) {
    console.error('No paths configured. Please check your configuration.')
    return 0
  }

  const fileRegexes = (config.filePatterns ?? ['use-i18n']).map(
    (p) => new RegExp(p),
  )

  const startTime = performance.now()
  for (const { srcPath, localPath } of pathsToProcess) {
    let allExtractedTranslations: string[] = []
    let pathUnusedLocalesCount = 0

    for (const pathEntry of srcPath) {
      const resolvedPathEntry = path.resolve(pathEntry)
      const ignorePathExists = config.ignorePaths?.some(
        (ignorePath) => path.resolve(ignorePath) === resolvedPathEntry,
      )
      if (ignorePathExists) continue
      const files = searchFilesRecursively({
        excludePatterns,
        regexes: fileRegexes,
        baseDir: pathEntry,
      })

      const extractedTranslations = files.flatMap((file) =>
        analyze({
          filePath: file,
          scopedNames: config.scopedNames,
          customPatterns: config.customPatterns,
        }),
      )

      allExtractedTranslations = [
        ...allExtractedTranslations,
        ...extractedTranslations,
      ]
    }

    allExtractedTranslations = [...new Set(allExtractedTranslations)].sort()

    const localeFilePath = `${localPath}/${localesNames}.${localesExtensions}`
    const resolvedLocaleFilePath = path.resolve(localeFilePath)
    const ignorePathExists = config.ignorePaths?.some(
      (ignorePath) => path.resolve(ignorePath) === resolvedLocaleFilePath,
    )
    if (fs.existsSync(localeFilePath) && !ignorePathExists) {
      console.log(`${localeFilePath}...`)

      const localLines = fs
        .readFileSync(localeFilePath, 'utf-8')
        .split('\n')
        .map((line) => line.trim())
        .filter(
          (line) =>
            !line.startsWith('//') &&
            line.match(/(?:['"][^'"]*['"]\s*:|^[a-zA-Z_$][\w$]*\s*:)/),
        )
        .map(
          (line) =>
            (line.match(/['"]([^'"]+)['"]\s*:/) ??
              line.match(/^([a-zA-Z_$][\w$]*)\s*:/))?.[1] ?? '',
        )
        .filter(Boolean)
        .sort()

      const missingTranslations = getMissingTranslations({
        localLines,
        extractedTranslations: allExtractedTranslations,
        excludeKey: config.excludeKey,
        prefixKeys: config.prefixKeys,
      })

      pathUnusedLocalesCount = missingTranslations.length
      totalUnusedLocales += pathUnusedLocalesCount

      const formattedMissingTranslations = missingTranslations
        .map((translation) => `\x1b[31m${translation}\x1b[0m`)
        .join('\n')

      const message = missingTranslations.length
        ? `Unused translations in \x1b[33m${localeFilePath}\x1b[0m : \x1b[31m${pathUnusedLocalesCount}   \n${formattedMissingTranslations}\x1b[0m`
        : undefined

      if (message) {
        unusedLocalesCountByPath.push({
          path: localPath,
          messages: message,
        })
      }

      // Remove the unused locale keys
      if (action === 'remove') {
        removeLocaleKeys({
          localePath: localeFilePath,
          missingTranslations: missingTranslations,
        })
      }
    }
  }
  const endTime = performance.now()

  summary({ unusedLocalesCountByPath, totalUnusedLocales })
  console.log(
    `\x1b[38;2;128;128;128mDuration   : ${(endTime - startTime).toFixed(
      0,
    )}ms\x1b[0m`,
  )

  return totalUnusedLocales
}
