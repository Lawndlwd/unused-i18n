export const extractScopedTs = (
  fileContent: string,
  namespaceTranslation: string
): string[] => {
  const patterns = [
    /scopedT\(\s*(['"`])([\s\S]*?)\1\s*(?:,|\))/g,
    /scopedT\(\s*(['"`])([^'"`]+)\1\s*,\s*\{/g, // Matches scopedT('key', { ... })
    /scopedT\(\s*([^()]*\?)\s*([^():]*):\s*([^()]*\s*)\)/g,
    /scopedT\(\s*`([^`]+)\${([^}]+)}([^`]+)`\s*\)/g,
    /scopedT\(\s*`([^`]+)\${([^}]+)}`\s*\)/g,
    /scopedT\(\s*`([^`]+)\${([^}]+)}([^`]+)\${([^}]+)}([^`]+)`\s*\)/g,
    /scopedT\(\s*`([^`]+)`\s*,\s*\{[\s\S]*?\}\s*\)/g, // Matches scopedT(`key`, {...})
  ]

  const scopedTs: string[] = []
  const namespaceTranslationTrimmed = namespaceTranslation
    .replace(/'/g, '')
    .replace(/,/g, '')

  patterns.forEach((pattern) => {
    let match
    while ((match = pattern.exec(fileContent))) {
      const values = match
        .slice(1)
        .map((val) => val.trim().replace(/'/g, '').replace(/,/g, ''))
      scopedTs.push(`${namespaceTranslationTrimmed}.${values.join('')}`)
    }
  })

  return scopedTs
}

export const extractNormalTs = (fileContent: string): string[] => {
  const patterns = [
    /t\(\s*(['"`])([\s\S]*?)\1\s*(?:,|\))/g,
    /t\(\s*(['"`])([^'"`]+)\1\s*,\s*\{/g, // Matches t('key', { ... })
    /t\(\s*([^()]*\?)\s*([^():]*):\s*([^()]*\s*)\)/g,
    /t\(\s*`([^`]+)\${([^}]+)}([^`]+)`\s*\)/g,
    /t\(\s*`([^`]+)\${([^}]+)}`\s*\)/g,
    /t\(\s*`([^`]+)\${([^}]+)}([^`]+)\${([^}]+)}([^`]+)`\s*\)/g,
    /t\(\s*`([^`]+)`\s*,\s*\{[\s\S]*?\}\s*\)/g, // Matches t(`key`, {...})
  ]

  const normalTs: string[] = []

  patterns.forEach((pattern) => {
    let match
    while ((match = pattern.exec(fileContent))) {
      const values = match
        .slice(1)
        .map((val) => val.trim().replace(/'/g, '').replace(/,/g, ''))
      normalTs.push(values.join(''))
    }
  })

  return normalTs
}
