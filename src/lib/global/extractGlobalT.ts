import { ExtractTranslationArgs } from '../../types'

export const extractGlobalT = ({
  fileContent,
}: ExtractTranslationArgs): string[] => {
  const tPattern =
    /\bt\(\s*(?:'([\s\S]*?)'|"([\s\S]*?)")\s*(?:,|\))/g
  const tPatternWithTernary =
    /\bt\(\s*([\s\S]+?)\s*\?\s*(?:'([^'\n]+)'|"([^"\n]+)")\s*:\s*(?:'([^'\n]+)'|"([^"\n]+)")\s*,?\s*\)/gm
  const tVariablePattern = /\bt\(\s*([a-zA-Z_$][\w.$]*)\s*\)/g
  const tTemplatePattern = /\bt\(\s*`([\s\S]*?)`\s*(?:,|\))/g
  const tTernaryTemplatePattern =
    /\bt\(\s*[\s\S]+?\s*\?\s*`([\s\S]*?)`\s*:\s*`([\s\S]*?)`,?\s*\)/gm

  const normalTs: Set<string> = new Set()

  let match

  // Handle ternary expressions within t arguments
  while ((match = tPatternWithTernary.exec(fileContent))) {
    const trueValue = (match[2] ?? match[3])?.trim() ?? ''
    const falseValue = (match[4] ?? match[5])?.trim() ?? ''
    normalTs.add(trueValue.replace(/,/g, '').trim())
    normalTs.add(falseValue.replace(/,/g, '').trim())
  }

  // Handle ternary expressions with template literal branches
  while ((match = tTernaryTemplatePattern.exec(fileContent))) {
    const branches = [match[1], match[2]]
    for (const branch of branches) {
      const dynamicParts = branch
        .split(/(\$\{[^}]+\})/)
        .map((part) => {
          if (part.startsWith('${') && part.endsWith('}')) return '**'
          return part
        })
      normalTs.add(dynamicParts.join(''))
    }
  }

  // Handle regular t pattern
  while ((match = tPattern.exec(fileContent))) {
    const translation = (match[1] ?? match[2]).trim()

    if (translation.includes('${')) {
      const ternaryPattern = /\${([^}]*\s\?\s[^}]*:[^}]*)}/
      const ternaryMatch = translation.match(ternaryPattern)

      if (ternaryMatch) {
        const [fullMatch, ternary] = ternaryMatch
        const ternaryParts =
          /\?\s*['"]([^'"]+)['"]\s*:\s*['"]([^'"]+)['"]/.exec(ternary)

        if (ternaryParts) {
          const ifValue = ternaryParts[1]
          const elseValue = ternaryParts[2]

          normalTs.add(`${translation.replace(fullMatch, ifValue)}`)
          normalTs.add(`${translation.replace(fullMatch, elseValue)}`)
        } else {
          // Ternary with non-quoted branches — fall through to wildcard
          normalTs.add(`${translation.replace(/\${[^}]*}/g, '**')}`)
        }
      } else {
        normalTs.add(`${translation.replace(/\${[^}]*}/g, '**')}`)
      }
    } else {
      normalTs.add(translation)
    }
  }

  // Handle variable t pattern
  while ((match = tVariablePattern.exec(fileContent))) {
    normalTs.add('**')
  }

  // Handle template literals within t arguments
  while ((match = tTemplatePattern.exec(fileContent))) {
    const templateLiteral = match[1]

    const dynamicParts = templateLiteral
      .split(/(\$\{[^}]+\})/)
      .map((part) => {
        if (part.startsWith('${') && part.endsWith('}')) {
          return '**'
        }
        return part
      })
    normalTs.add(dynamicParts.join(''))
  }

  // Fallback: detect complex expression arguments and emit wildcard
  const tCallPattern = /\bt\(/g
  let callMatch
  while ((callMatch = tCallPattern.exec(fileContent))) {
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
      normalTs.add('**')
    }
  }

  return Array.from(normalTs)
}
