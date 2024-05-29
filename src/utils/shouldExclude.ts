import { ShouldExcludeArgs } from '../types'

export const shouldExclude = ({
  excludeKey,
  line,
}: ShouldExcludeArgs): boolean => {
  if (!excludeKey) return false
  if (typeof excludeKey === 'string') {
    return line.includes(excludeKey)
  } else {
    return excludeKey.some((key) => line.includes(key))
  }
}
