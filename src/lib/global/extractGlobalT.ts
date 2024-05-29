import { ExtractTranslationArgs } from '../../types'

export const extractGlobalT = ({
  fileContent,
}: ExtractTranslationArgs): string[] => {
  const tPattern = /t\(\s*['"`]([\s\S]*?)['"`]\s*(?:,|$|\))/g
  const tPatternWithTernary =
    /t\(\s*([\s\S]+?)\s*\?\s*['"`]([^'"`\n]+)['"`]\s*:\s*['"`]([^'"`\n]+)['"`]\s*\)/gm
  const tVariablePattern = /t\(\s*([a-zA-Z_$][\w.$]*)\s*\)/g
  const tTemplatePattern = /t\(\s*`([\s\S]*?)`\s*\)/g

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

  // Handle template literals within t arguments
  while ((match = tTemplatePattern.exec(fileContent))) {
    const templateLiteral = match[1]

    const dynamicParts = templateLiteral.split(/(\$\{[^}]+\})/).map((part) => {
      if (part.startsWith('${') && part.endsWith('}')) {
        return '**'
      }
      return part
    })
    normalTs.add(dynamicParts.join(''))
  }

  return Array.from(normalTs)
}
