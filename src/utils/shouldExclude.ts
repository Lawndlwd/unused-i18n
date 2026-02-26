import { ShouldExcludeArgs } from '../types'

const matchPattern = (line: string, pattern: string): boolean => {
  if (pattern.includes('*')) {
    const regexStr = pattern
      .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
      .replace(/\*/g, '.*')
    return new RegExp(`^${regexStr}$`).test(line)
  }
  return line === pattern
}

export const shouldExclude = ({
  excludeKey,
  line,
}: ShouldExcludeArgs): boolean => {
  if (!excludeKey) return false
  if (typeof excludeKey === 'string') {
    return matchPattern(line, excludeKey)
  }
  return excludeKey.some((key) => matchPattern(line, key))
}
