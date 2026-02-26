import { ExtractTranslationArgs } from '../../types'
export const extractNamespaceTranslation = ({
  fileContent,
}: ExtractTranslationArgs): string[] => {
  // Match regular namespaceTranslation
  const namespaceTranslationPattern =
    /namespaceTranslation\(\s*(?:'([\s\S]*?)'|"([\s\S]*?)")\s*,?\s*\)/g

  // Match ternary inside namespaceTranslation
  const namespaceTranslationPatternTernary =
    /namespaceTranslation\(\s*([^?]+?)\s*\?\s*(?:'([^'\n]+)'|"([^"\n]+)")\s*:\s*(?:'([^'\n]+)'|"([^"\n]+)")\s*,?\s*\)/g

  // Match template literal inside namespaceTranslation
  const namespaceTranslationPatternTemplateLiteral =
    /namespaceTranslation\(\s*`([\s\S]*?)`\s*,?\s*\)/g

  // Match ternary with template literal branches inside namespaceTranslation
  const namespaceTranslationPatternTernaryTemplateLiteral =
    /namespaceTranslation\(\s*[\s\S]+?\s*\?\s*`([\s\S]*?)`\s*:\s*`([\s\S]*?)`,?\s*\)/gm

  const matches: string[] = []
  let match

  // Extract regular namespaceTranslation matches
  while ((match = namespaceTranslationPattern.exec(fileContent)) !== null) {
    matches.push((match[1] ?? match[2]).trim())
  }

  // Extract ternary matches inside namespaceTranslation
  while (
    (match = namespaceTranslationPatternTernary.exec(fileContent)) !== null
  ) {
    const trueValue = (match[2] ?? match[3]).trim()
    const falseValue = (match[4] ?? match[5]).trim()
    matches.push(trueValue, falseValue)
  }

  // Extract ternary with template literal branches
  while (
    (match =
      namespaceTranslationPatternTernaryTemplateLiteral.exec(fileContent)) !==
    null
  ) {
    const branches = [match[1], match[2]]
    for (const branch of branches) {
      const dynamicParts = branch
        .split(/(\$\{[^}]+\})/)
        .map((part) => {
          if (part.startsWith('${') && part.endsWith('}')) return '**'
          return part
        })
      matches.push(dynamicParts.join(''))
    }
  }

  // Extract template literal matches inside namespaceTranslation
  while (
    (match = namespaceTranslationPatternTemplateLiteral.exec(fileContent)) !==
    null
  ) {
    const templateLiteral = match[1].trim()

    // Collect static and dynamic segments of the template literal
    const dynamicPartsPattern = /\${([^}]+)}/g
    let dynamicPart
    const segments: Array<
      | { type: 'static'; value: string }
      | { type: 'wildcard' }
      | { type: 'ternary'; values: [string, string] }
    > = []
    let lastIndex = 0

    while (
      (dynamicPart = dynamicPartsPattern.exec(templateLiteral)) !== null
    ) {
      // Add static part before this dynamic part
      if (dynamicPart.index > lastIndex) {
        segments.push({
          type: 'static',
          value: templateLiteral.slice(lastIndex, dynamicPart.index),
        })
      }

      const dynamicExpression = dynamicPart[1].trim()
      const ternaryMatch =
        /([^?]+?)\s*\?\s*(?:'([^'\n]+)'|"([^"\n]+)")\s*:\s*(?:'([^'\n]+)'|"([^"\n]+)")/.exec(
          dynamicExpression,
        )

      if (ternaryMatch) {
        const trueValue = (ternaryMatch[2] ?? ternaryMatch[3]).trim()
        const falseValue = (ternaryMatch[4] ?? ternaryMatch[5]).trim()
        segments.push({ type: 'ternary', values: [trueValue, falseValue] })
      } else {
        segments.push({ type: 'wildcard' })
      }

      lastIndex = dynamicPart.index + dynamicPart[0].length
    }

    // Add remaining static part
    if (lastIndex < templateLiteral.length) {
      segments.push({
        type: 'static',
        value: templateLiteral.slice(lastIndex),
      })
    }

    if (segments.every((s) => s.type === 'static')) {
      // No dynamic parts — push as-is
      matches.push(templateLiteral)
    } else {
      // Build all combinations from ternary expansions and wildcards
      let combinations = ['']
      for (const segment of segments) {
        if (segment.type === 'static') {
          combinations = combinations.map((c) => c + segment.value)
        } else if (segment.type === 'wildcard') {
          combinations = combinations.map((c) => `${c}**`)
        } else {
          combinations = combinations.flatMap((c) =>
            segment.values.map((v) => c + v),
          )
        }
      }
      matches.push(...combinations)
    }
  }

  // Remove duplicates and return the sorted result
  return [...new Set(matches)].sort()
}
