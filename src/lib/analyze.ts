import * as fs from 'fs'
import { extractNamespaceTranslation } from './scopedNamespace/extractNamespaceTranslation'
import { extractScopedTs } from './scopedNamespace/extractScopedTs'
import { extractGlobalT } from './global/extractGlobalT'
import { AnalyzeArgs } from '../types'

export const analyze = ({
  filePath,
  scopedNames,
  customPatterns,
}: AnalyzeArgs): string[] => {
  const fileContent = fs.readFileSync(filePath, 'utf-8')
  const namespaceTranslations = extractNamespaceTranslation({ fileContent })

  const scopedTs = (
    scopedNames?.map((scopedName) =>
      namespaceTranslations.flatMap((namespaceTranslation) =>
        extractScopedTs({ fileContent, namespaceTranslation, scopedName }),
      ),
    ) ?? []
  ).flat(2)

  const globalTs = extractGlobalT({ fileContent })

  const customTs: string[] = []
  if (customPatterns?.length) {
    for (const pattern of customPatterns) {
      const regex = new RegExp(pattern, 'g')
      let match
      while ((match = regex.exec(fileContent))) {
        if (match[1]) {
          customTs.push(match[1].trim())
        }
      }
    }
  }

  const translations = [...globalTs, ...scopedTs, ...customTs]

  return [...new Set(translations)].sort()
}
