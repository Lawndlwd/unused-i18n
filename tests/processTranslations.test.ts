import { describe, it, expect, vi, beforeEach } from 'vitest'
import { processTranslations } from '../src'
import * as fs from 'fs'
import { loadConfig } from '../src/utils/loadConfig'
import { searchFilesRecursively } from '../src/lib/search'
import { analyze } from '../src/lib/analyze'
import { shouldExclude } from '../src/utils/shouldExclude'

// Mock dependencies
vi.mock('fs')
vi.mock('../src/utils/loadConfig')
vi.mock('../src/lib/search')
vi.mock('../src/lib/remove')
vi.mock('perf_hooks')
vi.mock('../src/utils/missingTranslations')
vi.mock('../src/lib/analyze')
vi.mock('../src/utils/shouldExclude')

describe.skip('processTranslations', () => {
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
      ignorePaths: ['folder/file.js'],
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

    vi.mocked(loadConfig).mockResolvedValueOnce(config)
    vi.mocked(searchFilesRecursively).mockReturnValue(files)
    vi.mocked(analyze).mockReturnValue(extractedTranslations)
    vi.mocked(shouldExclude).mockReturnValue(false)
    vi.mocked(fs.existsSync).mockReturnValue(true)
    vi.mocked(fs.readFileSync).mockReturnValue(localeContent)
    vi.mocked(fs.writeFileSync).mockImplementation(vi.fn())

    processTranslations({ action: 'remove' })

    expect(fs.readFileSync).toHaveBeenCalledWith('localPath/en.js', 'utf-8')
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      'localPath/en.js',
      expectedWriteContent,
      'utf-8'
    )
  })
})
