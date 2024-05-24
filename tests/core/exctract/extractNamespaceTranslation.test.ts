import { describe, it, expect } from 'vitest'
import { extractNamespaceTranslation } from '../../../src/core/extract'

describe('extractNamespaceTranslation', () => {
  it('should extract namespace translations correctly', () => {
    const fileContent = `
      const scopedT = namespaceTranslation('namespace.key');
      const scopedTOne = namespaceTranslation('scopedTOne.key');
    `

    const expected = ['namespace.key', 'scopedTOne.key']
    const result = extractNamespaceTranslation(fileContent)

    expect(result).toEqual(expected)
  })

  it('should handle ternary expressions correctly', () => {
    const fileContent = `
      const scopedT = namespaceTranslation(variable ? 'namespace.keyTrue' : 'namespace.keyFalse');
    `

    const expected = ['namespace.keyTrue', 'namespace.keyFalse']
    const result = extractNamespaceTranslation(fileContent)

    expect(result).toEqual(expected)
  })
})
