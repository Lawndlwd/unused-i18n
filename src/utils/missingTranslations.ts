import { GetMissingTranslationsArgs } from '../types'
import { shouldExclude } from './shouldExclude'
import { escapeRegex } from './escapeRegex'

export const getMissingTranslations = ({
  localLines,
  excludeKey,
  extractedTranslations,
  prefixKeys,
}: GetMissingTranslationsArgs): string[] => {
  const exactMatches = new Set<string>()
  const wildcardPatterns: RegExp[] = []

  for (const item of extractedTranslations) {
    if (item.includes('**')) {
      if (item === '**') {
        wildcardPatterns.push(/^\w+$/)
      } else {
        const pattern = new RegExp(
          `^${escapeRegex(item).replace(/\\\*\\\*/g, '.*?')}$`,
        )
        wildcardPatterns.push(pattern)
      }
    } else {
      exactMatches.add(item)
    }
  }

  return localLines.filter((line) => {
    if (shouldExclude({ line, excludeKey })) {
      return false
    }

    if (prefixKeys?.length) {
      for (const prefix of prefixKeys) {
        if (line.startsWith(prefix)) {
          return false
        }
      }
    }

    if (exactMatches.has(line)) {
      return false
    }

    return !wildcardPatterns.some((pattern) => pattern.test(line))
  })
}
