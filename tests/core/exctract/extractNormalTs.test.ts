import { describe, it, expect } from 'vitest'
import { extractNormalTs } from '../../../src/core/extract'

describe('extractNormalTs', () => {
  it('should extract scoped translations correctly', () => {
    const fileContent = `
        {keyLabel ?? t('namespace.labelKey1')}
        {keyLabel ? t('namespace.labelKey2') : t('namespace.labelKey3')}
        {t(keyLabel ? 'labelKey4' : 'labelKey5')}
        {t(\`labelKey6.\${variable}\`)}
        {t(variable0)}
        {t(\`\${variable1}.\${variable2}\`)}
        {t('labelKey13', {
            name: t('labelKey14')
        })}
      `

    const namespaceTranslation = 'namespace'
    const expected = [
      'labelKey4',
      'labelKey5',
      'namespace.labelKey1',
      'namespace.labelKey2',
      'namespace.labelKey3',
      'labelKey6.**',
      '**',
      '**.**',
      'labelKey13',
      'labelKey14',
    ]
    const result = extractNormalTs(fileContent)

    expect(result).toEqual(expect.arrayContaining(expected))
    expect(expected).toEqual(expect.arrayContaining(result))
  })
})
