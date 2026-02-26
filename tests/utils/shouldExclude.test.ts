import { describe, it, expect } from 'vitest'
import { shouldExclude } from '../../src/utils/shouldExclude'

describe('shouldExclude', () => {
  it('should return false when no excludeKey is provided', () => {
    expect(shouldExclude({ line: 'some.key' })).toBe(false)
  })

  it('should match exact string excludeKey', () => {
    expect(
      shouldExclude({ line: 'exact.key', excludeKey: 'exact.key' }),
    ).toBe(true)
  })

  it('should NOT do substring matching for exact keys', () => {
    expect(
      shouldExclude({ line: 'myHeadTitle.key', excludeKey: 'headTitle' }),
    ).toBe(false)
  })

  it('should match wildcard suffix patterns', () => {
    expect(
      shouldExclude({ line: 'headTitle.foo', excludeKey: 'headTitle.*' }),
    ).toBe(true)
    expect(
      shouldExclude({
        line: 'headTitle.foo.bar',
        excludeKey: 'headTitle.*',
      }),
    ).toBe(true)
  })

  it('should NOT match wildcard patterns on unrelated keys', () => {
    expect(
      shouldExclude({ line: 'myHeadTitle.foo', excludeKey: 'headTitle.*' }),
    ).toBe(false)
  })

  it('should handle array of exclude keys', () => {
    const excludeKey = ['headTitle.*', 'some.exact.key']
    expect(shouldExclude({ line: 'headTitle.clusters', excludeKey })).toBe(true)
    expect(shouldExclude({ line: 'some.exact.key', excludeKey })).toBe(true)
    expect(shouldExclude({ line: 'other.key', excludeKey })).toBe(false)
  })
})
