import * as fs from 'fs'

export const removeLocaleKeys = (
  localePath: string,
  keysToRemove: string[]
) => {
  const localeContent = fs.readFileSync(localePath, 'utf-8').split('\n')
  let removeNextLine = -1

  const updatedLocaleContent = localeContent.reduce(
    (acc: string[], line, index) => {
      const match = line.match(/^\s*'([^']+)':/)
      if (match) {
        const key = match[1]
        if (keysToRemove.includes(key)) {
          if (line.trim().endsWith('} as const')) {
            acc.push(line)
          }
          if (line.trim().endsWith(':')) {
            removeNextLine = index + 1
          }
        } else {
          acc.push(line)
        }
      } else {
        if (removeNextLine === index) {
          removeNextLine = -1
        } else {
          acc.push(line)
        }
      }

      return acc
    },
    []
  )

  fs.writeFileSync(localePath, updatedLocaleContent.join('\n'), 'utf-8')
}
