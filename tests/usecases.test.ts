import { describe, it, expect } from 'vitest'
import { extractGlobalT } from '../src/lib/global/extractGlobalT'
import { extractScopedTs } from '../src/lib/scopedNamespace/extractScopedTs'

describe('real-world use cases', () => {
  it('template literal with params and fallback', () => {
    const fileContent = `
      const resourceText =
        t(\`resourceType.\${resourceType}\`, { count: 2 }) || resourceType
    `
    const result = extractGlobalT({ fileContent })
    expect(result).toContain('resourceType.**')
  })

  it('template literal inside template string expression', () => {
    const fileContent = `
      res[locality].push({
        count,
        resourceType: resourceCounters.type,
        text: \`\${count} \${
          t(\`resourceType.\${resourceCounters.type}\`, { count }) ||
          resourceCounters.type
        }\`,
      })
    `
    const result = extractGlobalT({ fileContent })
    expect(result).toContain('resourceType.**')
  })

  it('multiline ternary with trailing comma', () => {
    const fileContent = `
      {t(
        hasError
          ? 'searchbar.api_unavailable.content'
          : 'searchbar.no_results.content',
      )}
    `
    const result = extractGlobalT({ fileContent })
    expect(result).toContain('searchbar.api_unavailable.content')
    expect(result).toContain('searchbar.no_results.content')
  })

  it('template literal with complex params (ternary, nullish coalescing)', () => {
    const fileContent = `
      {t(\`searchbar.\${filter.id}\`, { count: counts[filter.id] ?? 0 })}
    `
    const result = extractGlobalT({ fileContent })
    expect(result).toContain('searchbar.**')
  })

  it('template literal with params in assignment', () => {
    const fileContent = `
      const text =
        t(\`resourceType.\${resourceType}\`, { count: value }) ||
        resourceType
    `
    const result = extractGlobalT({ fileContent })
    expect(result).toContain('resourceType.**')
  })

  it('scopedT template literal with non-quoted ternary branch (variable)', () => {
    const fileContent = `
      label={
        hasErrors
          ? scopedT(\`step.\${step !== 0 ? step : '1'}.error\`)
          : scopedT(\`step.\${step !== 0 ? step : '1'}\`)
      }
    `
    const result = extractScopedTs({
      fileContent,
      namespaceTranslation: 'namespace',
      scopedName: 'scopedT',
    })
    // Mixed variable/string ternary falls back to wildcard
    expect(result).toContain('namespace.step.**.error')
    expect(result).toContain('namespace.step.**')
  })
})
