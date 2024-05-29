import { ExtractTranslationArgs } from '../../types'

export const extractNamespaceTranslation = ({
  fileContent,
}: ExtractTranslationArgs): string[] => {
  const namespaceTranslationPattern =
    /namespaceTranslation\(\s*['"`]([\s\S]*?)['"`]\s*,?\s*\)/g
  const namespaceTranslationPatternTernary =
    /namespaceTranslation\(\s*([^()]*\?)\s*['"`]([^'"`]*?)['"`]\s*:\s*['"`]([^'"`]*?)['"`]\s*\)/

  const matches = []
  let match

  // Extract matches for the regular namespaceTranslation pattern
  while ((match = namespaceTranslationPattern.exec(fileContent)) !== null) {
    matches.push(match[1].trim())
  }

  // Extract matches for the ternary pattern
  const ternaryMatch = fileContent.match(namespaceTranslationPatternTernary)
  if (ternaryMatch) {
    const trueValue = ternaryMatch[2].trim()
    const falseValue = ternaryMatch[3].trim()
    matches.push(trueValue, falseValue)
  }

  return matches
}
