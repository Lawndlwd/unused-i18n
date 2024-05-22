import * as fs from 'fs'
import * as path from 'path'

export const searchFilesWithPattern = (
  baseDir: string,
  regex: RegExp
): string[] => {
  const foundFiles: string[] = []
  const searchRecursively = (directory: string): void => {
    const files = fs.readdirSync(directory)
    for (const file of files) {
      const fullPath = path.join(directory, file)
      if (fs.lstatSync(fullPath).isDirectory()) {
        searchRecursively(fullPath)
      } else if (regex.test(fs.readFileSync(fullPath, 'utf-8'))) {
        foundFiles.push(fullPath)
      }
    }
  }
  searchRecursively(baseDir)
  return foundFiles
}
