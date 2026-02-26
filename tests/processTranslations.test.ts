import { describe, it, expect, vi, beforeEach } from 'vitest'
import { processTranslations } from '../src'
import * as fs from 'fs'
import { loadConfig } from '@utils/loadConfig'
import { searchFilesRecursively } from '@lib/search'
import { analyze } from '@lib/analyze'
import { shouldExclude } from '@utils/shouldExclude'
import { getMissingTranslations } from '@utils/missingTranslations'

// Mock dependencies
vi.mock('fs')
vi.mock('@utils/loadConfig')
vi.mock('@lib/search')
vi.mock('@lib/remove')
vi.mock('perf_hooks', () => ({
  performance: { now: vi.fn(() => 0) },
}))
vi.mock('@utils/missingTranslations')
vi.mock('@lib/analyze')
vi.mock('@utils/shouldExclude')

describe('processTranslations', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('should process translations and return unused count', async () => {
    const config = {
      paths: [
        {
          srcPath: ['srcPath'],
          localPath: 'localPath',
        },
      ],
      excludeKey: [],
      scopedNames: ['scopedT'],
      localesExtensions: 'ts',
      localesNames: 'en',
      ignorePaths: [],
    }

    const files = ['file1.ts']
    const extractedTranslations = ['key1', 'key2']
    const localeContent = `
export default {
  'key1': 'value1',
  'key2': 'value2',
  'key3': 'value3',
  'key4': 'value4',
} as const
    `.trim()

    vi.mocked(loadConfig).mockResolvedValue(config)
    vi.mocked(searchFilesRecursively).mockReturnValue(files)
    vi.mocked(analyze).mockReturnValue(extractedTranslations)
    vi.mocked(shouldExclude).mockReturnValue(false)
    vi.mocked(getMissingTranslations).mockReturnValue(['key3', 'key4'])
    vi.mocked(fs.existsSync).mockReturnValue(true)
    vi.mocked(fs.readFileSync).mockReturnValue(localeContent)

    const count = await processTranslations({ action: 'display' })

    expect(count).toBe(2)
    expect(fs.readFileSync).toHaveBeenCalledWith('localPath/en.ts', 'utf-8')
  })

  it('should return 0 when no unused translations', async () => {
    const config = {
      paths: [
        {
          srcPath: ['srcPath'],
          localPath: 'localPath',
        },
      ],
      excludeKey: [],
      scopedNames: ['scopedT'],
      localesExtensions: 'ts',
      localesNames: 'en',
      ignorePaths: [],
    }

    vi.mocked(loadConfig).mockResolvedValue(config)
    vi.mocked(searchFilesRecursively).mockReturnValue(['file1.ts'])
    vi.mocked(analyze).mockReturnValue(['key1'])
    vi.mocked(getMissingTranslations).mockReturnValue([])
    vi.mocked(fs.existsSync).mockReturnValue(true)
    vi.mocked(fs.readFileSync).mockReturnValue(
      `export default {\n  'key1': 'value1',\n} as const`,
    )

    const count = await processTranslations({ action: 'display' })

    expect(count).toBe(0)
  })

  it('should handle JSON locale files with double-quote keys', async () => {
    const config = {
      paths: [
        {
          srcPath: ['srcPath'],
          localPath: 'localPath',
        },
      ],
      excludeKey: [],
      scopedNames: [],
      localesExtensions: 'json',
      localesNames: 'en',
      ignorePaths: [],
    }

    const jsonLocaleContent = `{
  "key1": "value1",
  "key2": "value2"
}`

    vi.mocked(loadConfig).mockResolvedValue(config)
    vi.mocked(searchFilesRecursively).mockReturnValue(['file1.ts'])
    vi.mocked(analyze).mockReturnValue(['key1'])
    vi.mocked(getMissingTranslations).mockReturnValue(['key2'])
    vi.mocked(fs.existsSync).mockReturnValue(true)
    vi.mocked(fs.readFileSync).mockReturnValue(jsonLocaleContent)

    const count = await processTranslations({ action: 'display' })

    expect(count).toBe(1)
  })
})
