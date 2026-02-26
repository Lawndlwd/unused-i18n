import * as fs from 'fs'
import { RemoveLocaleKeysArgs } from '../types'

const KEY_PATTERN = /^\s*(?:['"]([^'"]+)['"]\s*:|([a-zA-Z_$][\w$]*)\s*:)/

export const removeLocaleKeys = ({
  localePath,
  missingTranslations,
}: RemoveLocaleKeysArgs) => {
  const localeContent = fs.readFileSync(localePath, 'utf-8').split('\n')
  let removing = false

  const filteredContent = localeContent.reduce(
    (acc: string[], line) => {
      const match = line.match(KEY_PATTERN)
      if (match) {
        const key = match[1] ?? match[2]
        if (missingTranslations.includes(key)) {
          removing = true
          if (line.trim().endsWith('} as const')) {
            removing = false
            acc.push(line)
          }
          return acc
        }
        // New key found that is not in missingTranslations — stop removing
        removing = false
        acc.push(line)
      } else if (removing) {
        // Check if we hit a closing brace — stop removing and keep it
        if (/^\s*[}\]]/.test(line)) {
          removing = false
          acc.push(line)
        }
        // Otherwise skip the line (continuation of multi-line value)
      } else {
        acc.push(line)
      }

      return acc
    },
    [],
  )

  // Clean up trailing commas before closing braces
  const cleanedContent = filteredContent.map((line, i) => {
    const nextLine = filteredContent[i + 1]
    if (nextLine && line.trimEnd().endsWith(',') && /^\s*[}\]]/.test(nextLine)) {
      return line.replace(/,(\s*)$/, '$1')
    }
    return line
  })

  fs.writeFileSync(localePath, cleanedContent.join('\n'), 'utf-8')
}
