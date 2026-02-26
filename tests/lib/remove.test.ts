import { describe, it, expect, vi, beforeEach } from 'vitest'
import { removeLocaleKeys } from '../../src/lib/remove'
import * as fs from 'fs'

// Mock file system operations
vi.mock('fs')

describe('removeLocaleKeys', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should remove specified locale keys from the file', () => {
    const localePath = 'path/to/locale/en.js'
    const missingTranslations = ['key1', 'key4', 'key2']

    const fileContent = `export default {
  'key1': 'value1',
  'key2': 'value2',
  'key3': 'value3',
  'key4':
  'value4',
  'key5': 'value5',
} as const`

    const expectedContent = `export default {
  'key3': 'value3',
  'key5': 'value5'
} as const`

    vi.mocked(fs.readFileSync).mockReturnValue(fileContent)
    vi.mocked(fs.writeFileSync).mockImplementation(vi.fn())

    removeLocaleKeys({ localePath, missingTranslations })

    expect(fs.readFileSync).toHaveBeenCalledWith(localePath, 'utf-8')
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      localePath,
      expectedContent,
      'utf-8',
    )
  })

  it('should remove specified locale keys from the file on multi line', () => {
    const localePath = 'path/to/locale/en.js'
    const missingTranslations = ['key1', 'key5']

    const fileContent = `export default {
  'key1': 'value1',
  'key2': 'value2',
  'key3': 'value3',
  'key4':
  'value4',
  'key5': 'value5',
} as const`

    const expectedContent = `export default {
  'key2': 'value2',
  'key3': 'value3',
  'key4':
  'value4'
} as const`

    vi.mocked(fs.readFileSync).mockReturnValue(fileContent)
    vi.mocked(fs.writeFileSync).mockImplementation(vi.fn())

    removeLocaleKeys({ localePath, missingTranslations })

    expect(fs.readFileSync).toHaveBeenCalledWith(localePath, 'utf-8')
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      localePath,
      expectedContent,
      'utf-8',
    )
  })

  it('should handle multi-line values spanning 3+ lines', () => {
    const localePath = 'path/to/locale/en.js'
    const missingTranslations = ['key2']

    const fileContent = `export default {
  'key1': 'value1',
  'key2':
    'line one ' +
    'line two',
  'key3': 'value3',
} as const`

    const expectedContent = `export default {
  'key1': 'value1',
  'key3': 'value3'
} as const`

    vi.mocked(fs.readFileSync).mockReturnValue(fileContent)
    vi.mocked(fs.writeFileSync).mockImplementation(vi.fn())

    removeLocaleKeys({ localePath, missingTranslations })

    expect(fs.writeFileSync).toHaveBeenCalledWith(
      localePath,
      expectedContent,
      'utf-8',
    )
  })

  it('should clean up trailing commas before closing braces', () => {
    const localePath = 'path/to/locale/en.js'
    const missingTranslations = ['key3']

    const fileContent = `export default {
  'key1': 'value1',
  'key2': 'value2',
  'key3': 'value3',
} as const`

    const expectedContent = `export default {
  'key1': 'value1',
  'key2': 'value2'
} as const`

    vi.mocked(fs.readFileSync).mockReturnValue(fileContent)
    vi.mocked(fs.writeFileSync).mockImplementation(vi.fn())

    removeLocaleKeys({ localePath, missingTranslations })

    expect(fs.writeFileSync).toHaveBeenCalledWith(
      localePath,
      expectedContent,
      'utf-8',
    )
  })

  it('should support unquoted JS/TS keys', () => {
    const localePath = 'path/to/locale/en.ts'
    const missingTranslations = ['learnMoreAbout']

    const fileContent = `export default {
  learnMoreAbout: 'Learn more about {productName}',
  'some.dotted.key': 'value',
} as const`

    const expectedContent = `export default {
  'some.dotted.key': 'value'
} as const`

    vi.mocked(fs.readFileSync).mockReturnValue(fileContent)
    vi.mocked(fs.writeFileSync).mockImplementation(vi.fn())

    removeLocaleKeys({ localePath, missingTranslations })

    expect(fs.writeFileSync).toHaveBeenCalledWith(
      localePath,
      expectedContent,
      'utf-8',
    )
  })

  it('should support double-quote JSON keys', () => {
    const localePath = 'path/to/locale/en.json'
    const missingTranslations = ['key2']

    const fileContent = `{
  "key1": "value1",
  "key2": "value2",
  "key3": "value3"
}`

    const expectedContent = `{
  "key1": "value1",
  "key3": "value3"
}`

    vi.mocked(fs.readFileSync).mockReturnValue(fileContent)
    vi.mocked(fs.writeFileSync).mockImplementation(vi.fn())

    removeLocaleKeys({ localePath, missingTranslations })

    expect(fs.writeFileSync).toHaveBeenCalledWith(
      localePath,
      expectedContent,
      'utf-8',
    )
  })
})
