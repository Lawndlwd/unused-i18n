import { describe, it, expect, vi, beforeEach } from 'vitest'
import { processTranslations } from '../src'
import * as fs from 'fs'
import { loadConfig } from '../src/utils/loadConfig'
import { searchFilesWithPattern } from '../src/core/search'
import { extractTranslations } from '../src/core/extract'
import { shouldExclude } from '../src/utils/shouldExclude'

// Mock dependencies
vi.mock('fs')
vi.mock('./utils/loadConfig')
vi.mock('./core/search')
vi.mock('./core/extract')
vi.mock('./utils/shouldExclude')

describe('processTranslations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should process translations correctly', () => {
    const config = {
      paths: [
        {
          srcPath: ['srcPath'],
          localPath: 'localPath',
        },
      ],
      excludeKey: [],
      scopedNames: ['scopedT'],
      localesExtensions: 'js',
      localesNames: 'en',
      ignorePaths: 'folder/file.js',
    }

    const files = ['file1.js', 'folder/file.js']
    const extractedTranslations = ['key1', 'key2']
    const localeContent = `
export default {
  'key1': 'value1',
  'key2': 'value2',
  'key3': 'value3',
  'key4': 'value4',
} as const
    `.trim()

    const expectedWriteContent = `
export default {
  'key1': 'value1',
  'key2': 'value2',
} as const
    `.trim()

    // @ts-expect-error mockReturnValue not availble
    loadConfig.mockReturnValue(config)
    // @ts-expect-error mockReturnValue not availble
    searchFilesWithPattern.mockReturnValue(files)
    // @ts-expect-error mockReturnValue not availble
    extractTranslations.mockReturnValue(extractedTranslations)
    // @ts-expect-error mockReturnValue not availble
    fs.existsSync.mockReturnValue(true)
    // @ts-expect-error mockReturnValue not availble
    fs.readFileSync.mockReturnValue(localeContent)
    // @ts-expect-error mockReturnValue not availble
    shouldExclude.mockReturnValue(false)
    // @ts-expect-error mockReturnValue not availble
    fs.writeFileSync.mockImplementation(vi.fn())

    processTranslations()

    expect(fs.readFileSync).toHaveBeenCalledWith('localPath/en.js', 'utf-8')
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      'localPath/en.js',
      expectedWriteContent,
      'utf-8'
    )
  })
})
