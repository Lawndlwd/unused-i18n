import { describe, it, expect, vi } from 'vitest'
import { getMissingTranslations } from '../../src/utils/missingTranslations'
import { shouldExclude } from '../../src/utils/shouldExclude'

vi.mock('./shouldExclude')

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

    // @ts-expect-error mockReturnValue not availble
    shouldExclude.mockReturnValue(false)

    const result = getMissingTranslations(
      localLines,
      extractedTranslations,
      excludeKey
    )

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
    // @ts-expect-error mockReturnValue not availble
    shouldExclude.mockImplementation((line, keys) => keys.includes(line))

    const result = getMissingTranslations(
      localLines,
      extractedTranslations,
      excludeKey
    )

    const expected = ['billing.back.organization.dsds']

    expect(result).toEqual(expected)
  })
})
