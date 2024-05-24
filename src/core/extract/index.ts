import * as fs from 'fs'

export const extractNamespaceTranslation = (fileContent: string): string[] => {
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

export const extractScopedTs = (
  fileContent: string,
  namespaceTranslation: string,
  scopedName: string
): string[] => {
  // Patterns with the variable
  const scopedTPattern = new RegExp(
    `${scopedName}\\(\\s*['"\`']([\\s\\S]*?)['"\`']\\s*(?:,|\\))`,
    'g'
  )
  const scopedTPatternWithTernary = new RegExp(
    `${scopedName}\\(\\s*([\\s\\S]+?)\\s*\\?\\s*['"\`']([^'"\\\`\n]+)['"\`']\\s*:\\s*['"\`']([^'"\\\`\n]+)['"\`'],?\\s*\\)`,
    'gm'
  )
  const scopedTPatternWithTernaryAndParams = new RegExp(
    `${scopedName}\\(\\s*([^?\n]+)\\s*\\?\\s*['"\`']([^'"\\\`]+)['"\`']\\s*:\\s*['"\`']([^'"\\\`]+)['"\`'],\\s*\\{[\\s\\S]*?\\},?\\s*\\)`,
    'gm'
  )
  const scopedTVariablePattern = new RegExp(
    `${scopedName}\\(\\s*([a-zA-Z_$][\\w.$]*)\\s*\\)`,
    'g'
  )
  const scopedTTemplatePattern = new RegExp(
    `${scopedName}\\(\\s*\`([\\s\\S]*?)\`\\s*\\)`,
    'g'
  )

  const scopedTs: Set<string> = new Set()
  const namespaceTranslationTrimmed = namespaceTranslation
    .replace(/'/g, '')
    .replace(/,/g, '')

  let match

  // Handle ternary expressions within scopedT arguments
  while ((match = scopedTPatternWithTernary.exec(fileContent))) {
    const trueValue = match[2]
    const falseValue = match[3]

    scopedTs.add(
      `${namespaceTranslationTrimmed}.${trueValue
        .replace(/'/g, '')
        .replace(/,/g, '')
        .trim()}`
    )
    scopedTs.add(
      `${namespaceTranslationTrimmed}.${falseValue
        .replace(/'/g, '')
        .replace(/,/g, '')
        .trim()}`
    )
  }

  // Handle ternary expressions with additional parameters within scopedT arguments
  while ((match = scopedTPatternWithTernaryAndParams.exec(fileContent))) {
    const trueValue = match[2]?.trim() ?? ''
    const falseValue = match[3]?.trim() ?? ''

    scopedTs.add(
      `${namespaceTranslationTrimmed}.${trueValue
        .replace(/'/g, '')
        .replace(/,/g, '')}`
    )
    scopedTs.add(
      `${namespaceTranslationTrimmed}.${falseValue
        .replace(/'/g, '')
        .replace(/,/g, '')}`
    )
  }

  // Handle regular scopedT pattern
  while ((match = scopedTPattern.exec(fileContent))) {
    const scopedT = match[1].trim()

    const scopedTWithNamespace = `${namespaceTranslationTrimmed}.${scopedT}`

    if (scopedT.includes('${')) {
      const ternaryPattern = /\${([^}]*\s\?\s[^}]*:[^}]*)}/
      const ternaryMatch = scopedTWithNamespace.match(ternaryPattern)

      if (ternaryMatch) {
        const [fullMatch, ternary] = ternaryMatch
        const [ifValue, elseValue] = ternary
          .split(' ? ')[1]
          .split(':')
          .map((val) => val.trim().replace(/'/g, ''))

        const stringIf = `${scopedTWithNamespace.replace(fullMatch, ifValue)}`
        const stringElse = `${scopedTWithNamespace.replace(
          fullMatch,
          elseValue
        )}`

        scopedTs.add(stringIf)
        scopedTs.add(stringElse)
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

    const dynamicParts = templateLiteral.split(/(\$\{[^}]+\})/).map((part) => {
      if (part.startsWith('${') && part.endsWith('}')) {
        return '**'
      }
      return part
    })
    const scopedTWithNamespace = `${namespaceTranslationTrimmed}.${dynamicParts.join(
      ''
    )}`
    scopedTs.add(scopedTWithNamespace)
  }

  return Array.from(scopedTs)
}

export const extractScopedTOnes = (
  fileContent: string,
  namespaceTranslation: string
): string[] => {
  const scopedTOnePattern = /scopedTOne\(\s*['"`]([\s\S]*?)['"`]\s*(?:,|\))/g
  const scopedTOnePatternWithTernary =
    /scopedTOne\(\s*([\s\S]+?)\s*\?\s*['"`]([^'"`\n]+)['"`]\s*:\s*['"`]([^'"`\n]+)['"`]\s*,?\s*\)/gm

  const scopedTOnePatternWithTernaryAndParams =
    /scopedTOne\(\s*([^?\n]+)\s*\?\s*['"`]([^'"`]+)['"`]\s*:\s*['"`]([^'"`]+)['"`],\s*\{[\s\S]*?\},?\s*\)/gm

  const scopedTOneVariablePattern = /scopedTOne\(\s*([a-zA-Z_$][\w.$]*)\s*\)/g
  const scopedTOneTemplatePattern = /scopedTOne\(\s*`([\s\S]*?)`\s*\)/g

  const scopedTOnes: Set<string> = new Set()
  const namespaceTranslationTrimmed = namespaceTranslation
    .replace(/'/g, '')
    .replace(/,/g, '')

  let match

  // Handle ternary expressions within scopedTOne arguments
  while ((match = scopedTOnePatternWithTernary.exec(fileContent))) {
    const trueValue = match[2]
    const falseValue = match[3]

    scopedTOnes.add(
      `${namespaceTranslationTrimmed}.${trueValue
        .replace(/'/g, '')
        .replace(/,/g, '')
        .trim()}`
    )
    scopedTOnes.add(
      `${namespaceTranslationTrimmed}.${falseValue
        .replace(/'/g, '')
        .replace(/,/g, '')
        .trim()}`
    )
  }

  // Handle ternary expressions with additional parameters within scopedTOne arguments
  while ((match = scopedTOnePatternWithTernaryAndParams.exec(fileContent))) {
    const trueValue = match[2]?.trim() ?? ''
    const falseValue = match[3]?.trim() ?? ''

    scopedTOnes.add(
      `${namespaceTranslationTrimmed}.${trueValue
        .replace(/'/g, '')
        .replace(/,/g, '')}`
    )
    scopedTOnes.add(
      `${namespaceTranslationTrimmed}.${falseValue
        .replace(/'/g, '')
        .replace(/,/g, '')}`
    )
  }

  // Handle regular scopedTOne pattern
  while ((match = scopedTOnePattern.exec(fileContent))) {
    const scopedTOne = match[1].trim()
    const scopedTWithNamespace = `${namespaceTranslationTrimmed}.${scopedTOne}`

    if (scopedTOne.includes('${')) {
      const ternaryPattern = /\${([^}]*\s\?\s[^}]*:[^}]*)}/
      const ternaryMatch = scopedTWithNamespace.match(ternaryPattern)

      if (ternaryMatch) {
        const [fullMatch, ternary] = ternaryMatch
        const [ifValue, elseValue] = ternary
          .split(':')
          .map((val) => val.trim().replace(/'/g, ''))

        const stringIf = `${scopedTWithNamespace.replace(fullMatch, ifValue)}`
        const stringElse = `${scopedTWithNamespace.replace(
          fullMatch,
          elseValue
        )}`

        scopedTOnes.add(stringIf)
        scopedTOnes.add(stringElse)
      } else {
        scopedTOnes.add(`${scopedTWithNamespace.replace(/\${[^}]*}/g, '**')}`)
      }
    } else {
      scopedTOnes.add(scopedTWithNamespace)
    }
  }

  // Handle variable scopedTOne pattern
  while ((match = scopedTOneVariablePattern.exec(fileContent))) {
    const scopedTWithNamespace = `${namespaceTranslationTrimmed}.**`
    scopedTOnes.add(scopedTWithNamespace)
  }

  // Handle template literals within scopedTOne arguments
  while ((match = scopedTOneTemplatePattern.exec(fileContent))) {
    const templateLiteral = match[1]

    const dynamicParts = templateLiteral.split(/(\$\{[^}]+\})/).map((part) => {
      if (part.startsWith('${') && part.endsWith('}')) {
        return '**'
      }
      return part
    })
    const scopedTWithNamespace = `${namespaceTranslationTrimmed}.${dynamicParts.join(
      ''
    )}`
    scopedTOnes.add(scopedTWithNamespace)
  }

  return Array.from(scopedTOnes)
}

export const extractNormalTs = (fileContent: string): string[] => {
  const tPattern = /t\(\s*['"`]([\s\S]*?)['"`]\s*(?:,|$|\))/g
  const tPatternWithTernary =
    /t\(\s*([^'"`]+)\s*\?\s*['"`]([^'"`]+)['"`]\s*:\s*['"`]([^'"`]+)['"`]\s*\)/g
  const tVariablePattern = /t\(\s*([\w]+)\s*\)/g

  const normalTs: Set<string> = new Set()

  let match

  // Handle ternary expressions within t arguments
  while ((match = tPatternWithTernary.exec(fileContent))) {
    const trueValue = match[2]
    const falseValue = match[3]
    normalTs.add(trueValue.replace(/'/g, '').replace(/,/g, '').trim())
    normalTs.add(falseValue.replace(/'/g, '').replace(/,/g, '').trim())
  }

  // Handle regular t pattern
  while ((match = tPattern.exec(fileContent))) {
    const translation = match[1].trim()

    if (translation.includes('${')) {
      const ternaryPattern = /\${([^}]*\s\?\s[^}]*:[^}]*)}/
      const ternaryMatch = translation.match(ternaryPattern)

      if (ternaryMatch) {
        const [fullMatch, ternary] = ternaryMatch
        const [ifValue, elseValue] = ternary
          .split(':')
          .map((val) => val.trim().replace(/'/g, ''))

        const stringIf = `${translation.replace(fullMatch, ifValue)}`
        const stringElse = `${translation.replace(fullMatch, elseValue)}`

        normalTs.add(stringIf)
        normalTs.add(stringElse)
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

  return Array.from(normalTs)
}

export const extractTranslations = (
  filePath: string,
  scopedNames: string[]
): string[] => {
  const fileContent = fs.readFileSync(filePath, 'utf-8')
  const namespaceTranslations = extractNamespaceTranslation(fileContent)

  const scopedTs = scopedNames
    .map((scopedName) =>
      namespaceTranslations.flatMap((namespaceTranslation) =>
        extractScopedTs(fileContent, namespaceTranslation, scopedName)
      )
    )
    .flat(2)

  const normalTs = extractNormalTs(fileContent)
  const translations = [...normalTs, ...scopedTs]

  return [...new Set(translations)].sort()
}
