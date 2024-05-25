import * as fs from 'fs'
import { extractNamespaceTranslation } from './scopedNamespace/extractNamespaceTranslation'
import { extractScopedTs } from './scopedNamespace/extractScopedTs'
import { extractGlobalT } from './global/extractGlobalT'
import { AnalyzeArgs } from '../types/types'

export const analyze = ({ filePath, scopedNames }: AnalyzeArgs): string[] => {
  const fileContent = fs.readFileSync(filePath, 'utf-8')
  const namespaceTranslations = extractNamespaceTranslation({ fileContent })

  const scopedTs = (
    scopedNames?.map((scopedName) =>
      namespaceTranslations.flatMap((namespaceTranslation) =>
        extractScopedTs({ fileContent, namespaceTranslation, scopedName })
      )
    ) ?? []
  ).flat(2)

  const globalTs = extractGlobalT({ fileContent })
  const translations = [...globalTs, ...scopedTs]

  return [...new Set(translations)].sort()
}
