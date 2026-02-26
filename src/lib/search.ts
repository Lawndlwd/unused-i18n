import * as fs from 'fs'
import * as path from 'path'
import { SearchFilesRecursivelyArgs } from '../types'

const SKIP_DIRS = new Set([
  'node_modules',
  '.git',
  'dist',
  '.next',
  'build',
  'coverage',
])

const BINARY_EXTENSIONS = new Set([
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.ico',
  '.woff',
  '.woff2',
  '.ttf',
  '.eot',
  '.svg',
  '.mp3',
  '.mp4',
  '.zip',
  '.tar',
  '.gz',
  '.pdf',
  '.lock',
])

export const searchFilesRecursively = ({
  baseDir,
  regexes,
  excludePatterns,
}: SearchFilesRecursivelyArgs): string[] => {
  const foundFiles: string[] = []

  function searchRecursively(directory: string): void {
    const files = fs.readdirSync(directory)

    for (const file of files) {
      const fullPath = path.join(directory, file)
      // Skip excluded patterns
      if (excludePatterns.some((pattern) => pattern.test(fullPath))) {
        continue
      }
      if (fs.lstatSync(fullPath).isDirectory()) {
        if (SKIP_DIRS.has(file)) {
          continue
        }
        searchRecursively(fullPath)
      } else {
        const ext = path.extname(fullPath).toLowerCase()
        if (BINARY_EXTENSIONS.has(ext)) {
          continue
        }
        const content = fs.readFileSync(fullPath, 'utf-8')
        if (
          regexes.some((regex) => {
            regex.lastIndex = 0
            return regex.test(content)
          })
        ) {
          foundFiles.push(fullPath)
        }
      }
    }
  }

  searchRecursively(baseDir)

  return foundFiles
}
