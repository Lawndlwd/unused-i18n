import { ExtractScopedTsArgs } from '../../types'
import { escapeRegex } from '../../utils/escapeRegex'

export const extractScopedTs = ({
  scopedName,
  namespaceTranslation,
  fileContent,
}: ExtractScopedTsArgs): string[] => {
  const escaped = escapeRegex(scopedName)
  // Patterns with the variable
  const scopedTPattern = new RegExp(
    `${escaped}\\(\\s*(?:'([\\s\\S]*?)'|"([\\s\\S]*?)")\\s*(?:,|\\))`,
    'g',
  )
  const scopedTPatternWithTernary = new RegExp(
    `${escaped}\\(\\s*([\\s\\S]+?)\\s*\\?\\s*(?:'([^'\\n]+)'|"([^"\\n]+)")\\s*:\\s*(?:'([^'\\n]+)'|"([^"\\n]+)"),?\\s*\\)`,
    'gm',
  )
  const scopedTPatternWithTernaryAndParams = new RegExp(
    `${escaped}\\(\\s*([^?\\n]+)\\s*\\?\\s*(?:'([^']+)'|"([^"]+)")\\s*:\\s*(?:'([^']+)'|"([^"]+)"),\\s*\\{[\\s\\S]*?\\},?\\s*\\)`,
    'gm',
  )
  const scopedTVariablePattern = new RegExp(
    `${escaped}\\(\\s*([a-zA-Z_$][\\w.$]*)\\s*\\)`,
    'g',
  )
  const scopedTTemplatePattern = new RegExp(
    `${escaped}\\(\\s*\`([\\s\\S]*?)\`\\s*(?:,|\\))`,
    'g',
  )
  const scopedTTernaryTemplatePattern = new RegExp(
    `${escaped}\\(\\s*[\\s\\S]+?\\s*\\?\\s*\`([\\s\\S]*?)\`\\s*:\\s*\`([\\s\\S]*?)\`,?\\s*\\)`,
    'gm',
  )

  const scopedTs: Set<string> = new Set()
  const namespaceTranslationTrimmed = namespaceTranslation
    .replace(/'/g, '')
    .replace(/,/g, '')

  let match

  // Handle ternary expressions within scopedT arguments
  while ((match = scopedTPatternWithTernary.exec(fileContent))) {
    const trueValue = (match[2] ?? match[3])?.trim() ?? ''
    const falseValue = (match[4] ?? match[5])?.trim() ?? ''

    scopedTs.add(
      `${namespaceTranslationTrimmed}.${trueValue
        .replace(/,/g, '')
        .trim()}`,
    )
    scopedTs.add(
      `${namespaceTranslationTrimmed}.${falseValue
        .replace(/,/g, '')
        .trim()}`,
    )
  }

  // Handle ternary expressions with additional parameters within scopedT arguments
  while ((match = scopedTPatternWithTernaryAndParams.exec(fileContent))) {
    const trueValue = (match[2] ?? match[3])?.trim() ?? ''
    const falseValue = (match[4] ?? match[5])?.trim() ?? ''

    scopedTs.add(
      `${namespaceTranslationTrimmed}.${trueValue.replace(/,/g, '')}`,
    )
    scopedTs.add(
      `${namespaceTranslationTrimmed}.${falseValue.replace(/,/g, '')}`,
    )
  }

  // Handle ternary expressions with template literal branches
  while ((match = scopedTTernaryTemplatePattern.exec(fileContent))) {
    const branches = [match[1], match[2]]
    for (const branch of branches) {
      const ternaryInTemplatePattern = /\${([^}]*\s\?\s[^}]*:[^}]*)}/
      const ternaryMatch = branch.match(ternaryInTemplatePattern)

      if (ternaryMatch) {
        const [fullMatch, ternary] = ternaryMatch
        const ternaryParts =
          /\?\s*['"]([^'"]+)['"]\s*:\s*['"]([^'"]+)['"]/.exec(ternary)

        if (ternaryParts) {
          const ifValue = ternaryParts[1]
          const elseValue = ternaryParts[2]
          const base = `${namespaceTranslationTrimmed}.${branch}`
          scopedTs.add(base.replace(fullMatch, ifValue))
          scopedTs.add(base.replace(fullMatch, elseValue))
        } else {
          const dynamicParts = branch
            .split(/(\$\{[^}]+\})/)
            .map((part) => {
              if (part.startsWith('${') && part.endsWith('}')) return '**'
              return part
            })
          scopedTs.add(
            `${namespaceTranslationTrimmed}.${dynamicParts.join('')}`,
          )
        }
      } else {
        const dynamicParts = branch
          .split(/(\$\{[^}]+\})/)
          .map((part) => {
            if (part.startsWith('${') && part.endsWith('}')) return '**'
            return part
          })
        scopedTs.add(
          `${namespaceTranslationTrimmed}.${dynamicParts.join('')}`,
        )
      }
    }
  }

  // Handle regular scopedT pattern
  while ((match = scopedTPattern.exec(fileContent))) {
    const scopedT = (match[1] ?? match[2]).trim()

    const scopedTWithNamespace = `${namespaceTranslationTrimmed}.${scopedT}`

    if (scopedT.includes('${')) {
      const ternaryPattern = /\${([^}]*\s\?\s[^}]*:[^}]*)}/
      const ternaryMatch = scopedTWithNamespace.match(ternaryPattern)

      if (ternaryMatch) {
        const [fullMatch, ternary] = ternaryMatch
        const ternaryParts =
          /\?\s*['"]([^'"]+)['"]\s*:\s*['"]([^'"]+)['"]/.exec(ternary)

        if (ternaryParts) {
          const ifValue = ternaryParts[1]
          const elseValue = ternaryParts[2]

          scopedTs.add(`${scopedTWithNamespace.replace(fullMatch, ifValue)}`)
          scopedTs.add(
            `${scopedTWithNamespace.replace(fullMatch, elseValue)}`,
          )
        }
      } else {
        scopedTs.add(`${scopedTWithNamespace.replace(/\${[^}]*}/g, '**')}`)
      }
    } else {
      scopedTs.add(scopedTWithNamespace)
    }
  }

  // Handle variable scopedT pattern
  while ((match = scopedTVariablePattern.exec(fileContent))) {
    const scopedTWithNamespace = `${namespaceTranslationTrimmed}.**`
    scopedTs.add(scopedTWithNamespace)
  }

  // Handle template literals within scopedT arguments
  while ((match = scopedTTemplatePattern.exec(fileContent))) {
    const templateLiteral = match[1]

    // Check for ternary expressions inside dynamic parts
    const ternaryInTemplatePattern = /\${([^}]*\s\?\s[^}]*:[^}]*)}/
    const ternaryMatch = templateLiteral.match(ternaryInTemplatePattern)

    if (ternaryMatch) {
      const [fullMatch, ternary] = ternaryMatch
      const ternaryParts =
        /\?\s*['"]([^'"]+)['"]\s*:\s*['"]([^'"]+)['"]/.exec(ternary)

      if (ternaryParts) {
        const ifValue = ternaryParts[1]
        const elseValue = ternaryParts[2]
        const base = `${namespaceTranslationTrimmed}.${templateLiteral}`

        scopedTs.add(base.replace(fullMatch, ifValue))
        scopedTs.add(base.replace(fullMatch, elseValue))
      } else {
        // Ternary with non-quoted branches (e.g. variables) — fall through to wildcard
        const dynamicParts = templateLiteral
          .split(/(\$\{[^}]+\})/)
          .map((part) => {
            if (part.startsWith('${') && part.endsWith('}')) {
              return '**'
            }
            return part
          })
        scopedTs.add(
          `${namespaceTranslationTrimmed}.${dynamicParts.join('')}`,
        )
      }
    } else {
      const dynamicParts = templateLiteral
        .split(/(\$\{[^}]+\})/)
        .map((part) => {
          if (part.startsWith('${') && part.endsWith('}')) {
            return '**'
          }
          return part
        })
      const scopedTWithNamespace = `${namespaceTranslationTrimmed}.${dynamicParts.join(
        '',
      )}`
      scopedTs.add(scopedTWithNamespace)
    }
  }

  // Fallback: detect complex expression arguments and emit wildcard
  const scopedTCallPattern = new RegExp(`${escaped}\\(`, 'g')
  let callMatch
  while ((callMatch = scopedTCallPattern.exec(fileContent))) {
    const startIdx = callMatch.index + callMatch[0].length
    let depth = 1
    let i = startIdx
    while (i < fileContent.length && depth > 0) {
      if (fileContent[i] === '(') depth++
      else if (fileContent[i] === ')') depth--
      i++
    }
    if (depth === 0) {
      const arg = fileContent.slice(startIdx, i - 1).trim()
      // Skip string literals and template literals (handled by specific patterns)
      if (/^['"`]/.test(arg)) continue
      // Skip simple identifiers (handled by variable pattern)
      if (/^[a-zA-Z_$][\w.$]*$/.test(arg)) continue
      // Skip ternary expressions with string/template literal branches (handled by ternary patterns)
      if (/\?\s*['"`]/.test(arg)) continue
      // Complex expression — emit wildcard
      scopedTs.add(`${namespaceTranslationTrimmed}.**`)
    }
  }

  return Array.from(scopedTs)
}
