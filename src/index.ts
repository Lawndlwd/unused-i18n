import * as fs from 'fs'
import { loadConfig } from './utils/loadConfig'
import { searchFilesWithPattern } from './core/search'
import { extractTranslations } from './core/extract'
import { removeLocaleKeys } from './core/remove'
import { shouldExclude } from './utils/shouldExclude'
import { escapeRegex } from './utils/escapeRegex'

const config = loadConfig()

config.paths.forEach(({ srcPath, localPath }) => {
  const files = searchFilesWithPattern(srcPath, /use-i18n/)
  console.log('files', files)
  const extractedTranslations = files
    .map((file) => extractTranslations(file))
    .reduce((acc, val) => acc.concat(val), [])
    .sort()
    .filter((item, index, array) => array.indexOf(item) === index)

  const localeFilePath = `${localPath}/en.ts` // Adjust this if locale file naming is different
  if (fs.existsSync(localeFilePath)) {
    const localLines = fs
      .readFileSync(localeFilePath, 'utf-8')
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.match(/'[^']*':/))
      .map((line) => line.match(/'([^']+)':/)?.[1] ?? '')
      .sort()

    const missingTranslations = localLines.filter(
      (line) =>
        !shouldExclude(line, config.excludeKey) &&
        !(
          extractedTranslations.includes(line) ||
          extractedTranslations.some((item) =>
            new RegExp(`^${escapeRegex(item).replace(/\*\*/g, '.+')}$`).test(
              line
            )
          )
        )
    )

    // Log the missing translations for each locale
    console.log(`Missing translations for ${localeFilePath}:`)
    missingTranslations.forEach((translation) =>
      console.log(`  ${translation}`)
    )

    // Remove the unused locale keys
    removeLocaleKeys(localeFilePath, missingTranslations)
  } else {
    console.warn(`Locale file not found: ${localeFilePath}`)
  }
})
