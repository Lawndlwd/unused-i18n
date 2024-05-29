import { GetMissingTranslationsArgs } from '../types'
import { shouldExclude } from './shouldExclude'

export const getMissingTranslations = ({
  localLines,
  excludeKey,
  extractedTranslations,
}: GetMissingTranslationsArgs): string[] => {
  return localLines.filter((line) => {
    if (shouldExclude({ line, excludeKey })) {
      return false
    }

    if (extractedTranslations.includes(line)) {
      return false
    }

    return !extractedTranslations.some((item) => {
      if (item === '**') {
        return /^\w+$/.test(line)
      }
      const pattern = new RegExp(
        `^${escapeRegex(item).replace(/\\\*\\\*/g, '.*?')}$`
      )
      return pattern.test(line)
    })
  })
}

function escapeRegex(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
