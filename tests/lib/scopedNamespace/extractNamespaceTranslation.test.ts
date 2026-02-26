import { describe, it, expect } from 'vitest'
import { extractNamespaceTranslation } from '../../../src/lib/scopedNamespace/extractNamespaceTranslation'

describe('extractNamespaceTranslation', () => {
  it('should extract namespace translations correctly', () => {
    const fileContent = `
      const scopedT = namespaceTranslation('namespace.key');
      const scopedTOne = namespaceTranslation('scopedTOne.key');
    `

    const expected = ['namespace.key', 'scopedTOne.key']
    const result = extractNamespaceTranslation({ fileContent })

    expect(result).toEqual(expected)
  })

  it('should handle ternary expressions correctly', () => {
    const fileContent = `
      const scopedT = namespaceTranslation(variable ? 'namespace.keyTrue' : 'namespace.keyFalse');
    `

    const expected = ['namespace.keyTrue', 'namespace.keyFalse']
    const result = extractNamespaceTranslation({ fileContent })

    expect(result).toEqual(expect.arrayContaining(expected))
  })

  it('should preserve static prefix in template literals with dynamic parts', () => {
    const fileContent = `
      const scopedT = namespaceTranslation(\`ns.\${someVar}\`)
    `
    const result = extractNamespaceTranslation({ fileContent })

    expect(result).toContain('ns.**')
    expect(result).not.toContain('**')
    expect(result).not.toContain('someVar')
    expect(result).not.toContain('${someVar}')
    expect(result).not.toContain('ns.${someVar}')
  })

  it('should expand ternary in template literal preserving full namespace', () => {
    const fileContent = `
      const scopedT = namespaceTranslation(
        \`s2sVpn.modal.\${initialId ? 'replace' : 'attach'}\`,
      )
    `
    const result = extractNamespaceTranslation({ fileContent })

    expect(result).toContain('s2sVpn.modal.replace')
    expect(result).toContain('s2sVpn.modal.attach')
    expect(result).not.toContain('replace')
    expect(result).not.toContain('attach')
  })

  it('should handle ternary with two plain template literal branches', () => {
    const fileContent = `
      const scopedT = namespaceTranslation(
        isSingle
          ? \`domains.detail.deleteModal\`
          : \`domains.detail.multiDeleteModal\`,
      )
    `
    const result = extractNamespaceTranslation({ fileContent })

    expect(result).toContain('domains.detail.deleteModal')
    expect(result).toContain('domains.detail.multiDeleteModal')
  })

  it('should handle ternary with template literals containing dynamic parts', () => {
    const fileContent = `
      const scopedT = namespaceTranslation(
        isSingle
          ? \`domains.\${getDomainType()}.detail.zones.deleteModal\`
          : \`domains.\${getDomainType()}.detail.zones.multiDeleteModal\`,
      )
    `
    const result = extractNamespaceTranslation({ fileContent })

    expect(result).toContain('domains.**.detail.zones.deleteModal')
    expect(result).toContain('domains.**.detail.zones.multiDeleteModal')
  })
})
