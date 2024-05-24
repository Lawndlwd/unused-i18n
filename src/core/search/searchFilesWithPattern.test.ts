import { describe, it, expect, vi } from 'vitest'
import { searchFilesWithPattern } from '.'
import * as fs from 'fs'
import * as path from 'path'

// Mock file system operations
vi.mock('fs')

describe('searchFilesWithPattern', () => {
  it('should find files where content matches the regex pattern', () => {
    const baseDir = 'testDir'
    const regex = /use-i18n/

    const fsMock = {
      readdirSync: vi.fn((dir) => {
        if (dir === baseDir) return ['file1.js', 'file2.js', 'subdir']
        if (dir === path.join(baseDir, 'subdir')) return ['file3.js']
        return []
      }),
      lstatSync: vi.fn((filePath) => ({
        isDirectory: () => filePath === path.join(baseDir, 'subdir'),
      })),
      readFileSync: vi.fn((filePath) => {
        if (filePath === path.join(baseDir, 'file1.js'))
          return `
        import { useI18n } from '@scaleway/use-i18n'
        `
        if (filePath === path.join(baseDir, 'file2.js')) return 'no match here'
        if (filePath === path.join(baseDir, 'subdir', 'file3.js'))
          return `
        import { useI18n } from '@scaleway/use-i18n'
        `
        return ''
      }),
    }

    // @ts-expect-error mockImplementation no function
    fs.readdirSync.mockImplementation(fsMock.readdirSync)
    // @ts-expect-error mockImplementation no function
    fs.lstatSync.mockImplementation(fsMock.lstatSync)
    // @ts-expect-error mockImplementation no function
    fs.readFileSync.mockImplementation(fsMock.readFileSync)

    const expected = [
      path.join(baseDir, 'file1.js'),
      path.join(baseDir, 'subdir', 'file3.js'),
    ]

    const result = searchFilesWithPattern(baseDir, regex)

    expect(result).toEqual(expect.arrayContaining(expected))
    expect(expected).toEqual(expect.arrayContaining(result))
  })
})
