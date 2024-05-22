import * as fs from 'fs'

export const removeLocaleKeys = (
  localePath: string,
  keysToRemove: string[]
) => {
  const localeContent = fs.readFileSync(localePath, 'utf-8').split('\n')

  let inKeyToRemove = false

  const updatedLocaleContent = localeContent.reduce(
    (acc: string[], line, index, array) => {
      if (!inKeyToRemove) {
        const match = line.match(/'([^']+)':/)
        if (match) {
          const key = match[1]
          if (keysToRemove.includes(key)) {
            inKeyToRemove = true
          } else {
            acc.push(line)
          }
        } else {
          acc.push(line)
        }
      } else {
        if (
          line.trim().endsWith(',') ||
          (line.trim().endsWith('}') && !line.trim().endsWith('} as const'))
        ) {
          inKeyToRemove = false
        }
        if (!inKeyToRemove && line.trim().endsWith('} as const')) {
          acc.push(line)
        }
      }
      return acc
    },
    []
  )

  fs.writeFileSync(localePath, updatedLocaleContent.join('\n'), 'utf-8')
}
