export const shouldExclude = (
  line: string,
  excludeKey?: string | string[]
): boolean => {
  if (!excludeKey) return false
  if (typeof excludeKey === 'string') {
    return line.includes(excludeKey)
  } else {
    return excludeKey.some((key) => line.includes(key))
  }
}
