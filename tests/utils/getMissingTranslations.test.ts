import { describe, it, expect, vi } from 'vitest'
import { getMissingTranslations } from '../../src/utils/missingTranslations'
import { shouldExclude } from '../../src/utils/shouldExclude'

vi.mock('../../src/utils/shouldExclude')

describe('getMissingTranslations', () => {
  it('should return missing translations', () => {
    const localLines = [
      'billing.back.organization',
      'billing.back.organization.dsds',
      'dsds',
      'billing.budget.alert.go',
    ]

    const extractedTranslations = [
      'billing.back.organization',
      'billing.budget.alert.**',
      '**',
    ]

    const excludeKey: string[] = []

    vi.mocked(shouldExclude).mockReturnValue(false)

    const result = getMissingTranslations({
      localLines,
      extractedTranslations,
      excludeKey,
    })

    // ** matches single-segment keys like 'dsds', but not dotted keys
    const expected = ['billing.back.organization.dsds']
    expect(result).toEqual(expected)
  })

  it('should exclude keys based on shouldExclude', () => {
    const localLines = [
      'billing.back.organization',
      'billing.back.organization.dsds',
      'dsds',
      'billing.budget.alert.go.error',
    ]

    const extractedTranslations = [
      'billing.back.organization',
      'billing.budget.alert.**',
    ]

    const excludeKey = ['dsds']
    // @ts-expect-error mockReturnValue not available
    shouldExclude.mockImplementation(({ line, excludeKey: keys }) =>
      keys.includes(line),
    )

    const result = getMissingTranslations({
      localLines,
      extractedTranslations,
      excludeKey,
    })

    const expected = ['billing.back.organization.dsds']

    expect(result).toEqual(expected)
  })

  it('should match standalone ** only against single-segment keys', () => {
    const localLines = ['home', 'home.page.title', 'settings.theme']

    const extractedTranslations = ['**']

    vi.mocked(shouldExclude).mockReturnValue(false)

    const result = getMissingTranslations({
      localLines,
      extractedTranslations,
      excludeKey: [],
    })

    // ** matches 'home' (single segment) but not dotted keys
    expect(result).toEqual(['home.page.title', 'settings.theme'])
  })

  it('should match prefixed ** wildcard against dotted subkeys', () => {
    const localLines = [
      'billing.budget.alert.go',
      'billing.budget.alert.go.error',
      'billing.other',
    ]

    const extractedTranslations = ['billing.budget.alert.**']

    vi.mocked(shouldExclude).mockReturnValue(false)

    const result = getMissingTranslations({
      localLines,
      extractedTranslations,
      excludeKey: [],
    })

    // prefix.** matches any subkey under that prefix
    expect(result).toEqual(['billing.other'])
  })

  it('should treat prefixKeys as used', () => {
    const localLines = [
      'headTitle.clusters',
      'headTitle.clusters.create',
      'other.key',
    ]

    const extractedTranslations: string[] = []

    vi.mocked(shouldExclude).mockReturnValue(false)

    const result = getMissingTranslations({
      localLines,
      extractedTranslations,
      excludeKey: [],
      prefixKeys: ['headTitle'],
    })

    expect(result).toEqual(['other.key'])
  })
})
