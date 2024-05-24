export interface PathConfig {
  srcPath: string[]
  localPath: string
}

export interface Config {
  paths: PathConfig[]
  localesExtensions?: string
  localesNames?: string
  ignorePaths?: string[]
  excludeKey?: string | string[]
  scopedNames: ['scopedT', 'scopedTOne']
}
