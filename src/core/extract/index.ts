import * as fs from 'fs'
import { extractNormalTs, extractScopedTs } from './extractTranslations'

// export const extractTranslations = (filePath: string): string[] => {
//   const fileContent = fs.readFileSync(filePath, 'utf-8');

//   const extractNamespaceTranslation = (fileContent: string): string[] => {
//     const namespaceTranslationPattern =
//       /namespaceTranslation\(\s*['"`]([\s\S]*?)['"`]\s*,?\s*\)/
//     const namespaceTranslationPatternTernary =
//       /namespaceTranslation\(\s*([^()]*\?)\s*([^():]*):\s*([^()]*\s*)\)/

//     const match = fileContent.match(namespaceTranslationPatternTernary)
//     if (match) {
//       const trueValue = match[2]
//       const falseValue = match[3]
//       return [trueValue.trim(), falseValue.trim()]
//     }

//     const namespaceTranslationMatch = fileContent.match(
//       namespaceTranslationPattern
//     )
//     return namespaceTranslationMatch
//       ? [namespaceTranslationMatch[1].trim()]
//       : ['']
//   }

//   const extractScopedTs = (
//     fileContent: string,
//     namespaceTranslation: string
//   ): string[] => {
//     const patterns = [
//       /scopedT\(\s*(['"`])([\s\S]*?)\1\s*(?:,|\))/g,
//       /scopedT\(\s*(['"`])([^'"`]+)\1\s*,\s*\{/g, // Matches scopedT('key', { ... })
//       /scopedT\(\s*([^()]*\?)\s*([^():]*):\s*([^()]*\s*)\)/g,
//       /scopedT\(\s*`([^`]+)\${([^}]+)}([^`]+)`\s*\)/g,
//       /scopedT\(\s*`([^`]+)\${([^}]+)}`\s*\)/g,
//       /scopedT\(\s*`([^`]+)\${([^}]+)}([^`]+)\${([^}]+)}([^`]+)`\s*\)/g,
//       /scopedT\(\s*`([^`]+)`\s*,\s*\{[\s\S]*?\}\s*\)/g, // Matches scopedT(`key`, {...})
//     ]

//     const scopedTs: string[] = []
//     const namespaceTranslationTrimmed = namespaceTranslation
//       .replace(/'/g, '')
//       .replace(/,/g, '')

//     patterns.forEach((pattern) => {
//       let match
//       while ((match = pattern.exec(fileContent))) {
//         const values = match
//           .slice(1)
//           .map((val) => val.trim().replace(/'/g, '').replace(/,/g, ''))
//         scopedTs.push(`${namespaceTranslationTrimmed}.${values.join('')}`)
//       }
//     })

//     return scopedTs
//   }

//   const extractNormalTs = (fileContent: string): string[] => {
//     const patterns = [
//       /t\(\s*(['"`])([\s\S]*?)\1\s*(?:,|\))/g,
//       /t\(\s*(['"`])([^'"`]+)\1\s*,\s*\{/g, // Matches t('key', { ... })
//       /t\(\s*([^()]*\?)\s*([^():]*):\s*([^()]*\s*)\)/g,
//       /t\(\s*`([^`]+)\${([^}]+)}([^`]+)`\s*\)/g,
//       /t\(\s*`([^`]+)\${([^}]+)}`\s*\)/g,
//       /t\(\s*`([^`]+)\${([^}]+)}([^`]+)\${([^}]+)}([^`]+)`\s*\)/g,
//       /t\(\s*`([^`]+)`\s*,\s*\{[\s\S]*?\}\s*\)/g, // Matches t(`key`, {...})
//     ]

//     const normalTs: string[] = []

//     patterns.forEach((pattern) => {
//       let match
//       while ((match = pattern.exec(fileContent))) {
//         const values = match
//           .slice(1)
//           .map((val) => val.trim().replace(/'/g, '').replace(/,/g, ''))
//         normalTs.push(values.join(''))
//       }
//     })

//     return normalTs
//   }

//   const namespaceTranslations = extractNamespaceTranslation(fileContent)
//   const scopedTs = namespaceTranslations.flatMap((namespaceTranslation) =>
//     extractScopedTs(fileContent, namespaceTranslation)
//   )
//   const normalTs = extractNormalTs(fileContent)

//   const translations = [...normalTs, ...scopedTs]
//   return [...new Set(translations)].sort()
// }

export const extractTranslations = (filePath: string): string[] => {
  const fileContent = fs.readFileSync(filePath, 'utf-8')

  const namespaceTranslationPattern =
    /namespaceTranslation\(\s*['"`]([\s\S]*?)['"`]\s*,?\s*\)/
  const namespaceTranslationMatch = fileContent.match(
    namespaceTranslationPattern
  )
  const namespaceTranslation = namespaceTranslationMatch
    ? namespaceTranslationMatch[1].trim()
    : ''

  const scopedTs = extractScopedTs(fileContent, namespaceTranslation)
  const normalTs = extractNormalTs(fileContent)

  const translations = [...normalTs, ...scopedTs]
  return [...new Set(translations)].sort()
}
