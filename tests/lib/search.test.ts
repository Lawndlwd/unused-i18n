import { describe, it, expect, vi, beforeEach } from 'vitest'
import { searchFilesRecursively } from '../../src/lib/search'
import * as fs from 'fs'
import * as path from 'path'

vi.mock('fs')

describe('searchFilesRecursively', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should find files where content matches the regex pattern', () => {
    const baseDir = 'testDir'

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

    vi.mocked(fs.readFileSync).mockImplementation(fsMock.readFileSync)
    // @ts-expect-error mockImplementation no function
    vi.mocked(fs.lstatSync).mockImplementation(fsMock.lstatSync)
    // @ts-expect-error mockImplementation no function
    vi.mocked(fs.readdirSync).mockImplementation(fsMock.readdirSync)

    const expected = [
      path.join(baseDir, 'file1.js'),
      path.join(baseDir, 'subdir', 'file3.js'),
    ]

    const result = searchFilesRecursively({
      baseDir,
      regexes: [/use-i18n/],
      excludePatterns: [],
    })

    expect(result).toEqual(expect.arrayContaining(expected))
    expect(expected).toEqual(expect.arrayContaining(result))
  })

  it('should skip node_modules directories', () => {
    const baseDir = 'testDir'

    // @ts-expect-error mockImplementation no function
    vi.mocked(fs.readdirSync).mockImplementation((dir) => {
      if (dir === baseDir) return ['file1.js', 'node_modules']
      if (dir === path.join(baseDir, 'node_modules'))
        return ['shouldNotFind.js']
      return []
    })
    // @ts-expect-error mockImplementation no function
    vi.mocked(fs.lstatSync).mockImplementation((filePath) => ({
      isDirectory: () =>
        filePath === path.join(baseDir, 'node_modules'),
    }))
    vi.mocked(fs.readFileSync).mockImplementation(() => 'use-i18n')

    const result = searchFilesRecursively({
      baseDir,
      regexes: [/use-i18n/],
      excludePatterns: [],
    })

    expect(result).toEqual([path.join(baseDir, 'file1.js')])
  })

  it('should skip binary files', () => {
    const baseDir = 'testDir'

    // @ts-expect-error mockImplementation no function
    vi.mocked(fs.readdirSync).mockImplementation((dir) => {
      if (dir === baseDir)
        return ['file1.js', 'image.png', 'font.woff2']
      return []
    })
    // @ts-expect-error mockImplementation no function
    vi.mocked(fs.lstatSync).mockImplementation(() => ({
      isDirectory: () => false,
    }))
    vi.mocked(fs.readFileSync).mockImplementation(() => 'use-i18n')

    const result = searchFilesRecursively({
      baseDir,
      regexes: [/use-i18n/],
      excludePatterns: [],
    })

    expect(result).toEqual([path.join(baseDir, 'file1.js')])
    // readFileSync should not be called for binary files
    expect(fs.readFileSync).toHaveBeenCalledTimes(1)
  })

  it('should support custom filePatterns (multiple regexes)', () => {
    const baseDir = 'testDir'

    // @ts-expect-error mockImplementation no function
    vi.mocked(fs.readdirSync).mockImplementation((dir) => {
      if (dir === baseDir) return ['file1.js', 'file2.js', 'file3.js']
      return []
    })
    // @ts-expect-error mockImplementation no function
    vi.mocked(fs.lstatSync).mockImplementation(() => ({
      isDirectory: () => false,
    }))
    vi.mocked(fs.readFileSync).mockImplementation((filePath) => {
      if (filePath === path.join(baseDir, 'file1.js')) return 'use-i18n'
      if (filePath === path.join(baseDir, 'file2.js'))
        return 'namespaceTranslation'
      if (filePath === path.join(baseDir, 'file3.js')) return 'unrelated code'
      return ''
    })

    const result = searchFilesRecursively({
      baseDir,
      regexes: [/use-i18n/, /namespaceTranslation/],
      excludePatterns: [],
    })

    expect(result).toEqual(
      expect.arrayContaining([
        path.join(baseDir, 'file1.js'),
        path.join(baseDir, 'file2.js'),
      ]),
    )
    expect(result).not.toContain(path.join(baseDir, 'file3.js'))
  })
})
