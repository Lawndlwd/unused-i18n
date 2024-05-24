import { describe, it, expect, vi } from 'vitest'
import { removeLocaleKeys } from '.'
import * as fs from 'fs'

// Mock file system operations
vi.mock('fs')

describe('removeLocaleKeys', () => {
  it('should remove specified locale keys from the file', () => {
    const localePath = 'path/to/locale/en.js'
    const keysToRemove = ['key1', 'key4', 'key2']

    const fileContent = `export default {
  'key1': 'value1',
  'key2': 'value2',
  'key3': 'value3',
  'key4':
  'value4',
  'key5': 'value5',
} as const`

    const expectedContent = `
export default {
  'key3': 'value3',
  'key5': 'value5',
} as const`

    const fsMock = {
      readFileSync: vi.fn().mockReturnValue(fileContent),
      writeFileSync: vi.fn(),
    }

    // @ts-expect-error mockImplementation no function
    fs.readFileSync.mockImplementation(fsMock.readFileSync)
    // @ts-expect-error mockImplementation no function
    fs.writeFileSync.mockImplementation(fsMock.writeFileSync)

    removeLocaleKeys(localePath, keysToRemove)

    expect(fs.readFileSync).toHaveBeenCalledWith(localePath, 'utf-8')
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      localePath,
      expectedContent.trim(),
      'utf-8'
    )
  })
  it('should remove specified locale keys from the file on multi line', () => {
    const localePath = 'path/to/locale/en.js'
    const keysToRemove = ['key1', 'key5']

    const fileContent = `export default {
  'key1': 'value1',
  'key2': 'value2',
  'key3': 'value3',
  'key4':
  'value4',
  'key5': 'value5',
} as const`

    const expectedContent = `
export default {
  'key2': 'value2',
  'key3': 'value3',
  'key4':
  'value4',
} as const`

    const fsMock = {
      readFileSync: vi.fn().mockReturnValue(fileContent),
      writeFileSync: vi.fn(),
    }

    // @ts-expect-error mockImplementation no function
    fs.readFileSync.mockImplementation(fsMock.readFileSync)
    // @ts-expect-error mockImplementation no function
    fs.writeFileSync.mockImplementation(fsMock.writeFileSync)

    removeLocaleKeys(localePath, keysToRemove)

    expect(fs.readFileSync).toHaveBeenCalledWith(localePath, 'utf-8')
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      localePath,
      expectedContent.trim(),
      'utf-8'
    )
  })
})
