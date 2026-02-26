import { describe, it, expect } from 'vitest'
import { extractGlobalT } from '../../../src/lib/global/extractGlobalT'

describe('extractGlobalT', () => {
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
    const result = extractGlobalT({ fileContent })

    expect(result).toEqual(expect.arrayContaining(expected))
    expect(expected).toEqual(expect.arrayContaining(result))
  })

  it('should NOT match non-t functions like sort() or import()', () => {
    const fileContent = `
      const sorted = items.sort('x')
      const mod = import('module')
      const result = t('realKey')
    `
    const result = extractGlobalT({ fileContent })

    expect(result).toContain('realKey')
    expect(result).not.toContain('x')
    expect(result).not.toContain('module')
  })

  it('should match double-quoted keys', () => {
    const fileContent = `t("doubleQuoted")`
    const result = extractGlobalT({ fileContent })

    expect(result).toContain('doubleQuoted')
  })

  it('should handle ternary with template literal branches', () => {
    const fileContent = `
      {t(cond ? \`policy.\${pubPolicy}\` : \`policy.\${subPolicy}\`)}
      {t(isActive ? \`status.active\` : \`status.inactive\`)}
    `
    const result = extractGlobalT({ fileContent })

    expect(result).toContain('policy.**')
    expect(result).toContain('status.active')
    expect(result).toContain('status.inactive')
  })

  it('should handle complex expression arguments with wildcard fallback', () => {
    const fileContent = `
      {t(toCamelCase(offer.name) as 'costOptimized' | 'productionOptimized')}
    `
    const result = extractGlobalT({ fileContent })

    expect(result).toContain('**')
  })

  it('should NOT match mismatched quotes', () => {
    const fileContent = `t('mismatched")`
    const result = extractGlobalT({ fileContent })

    expect(result).not.toContain('mismatched')
  })
})
