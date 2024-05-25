export type PathConfig = {
  srcPath: string[]
  localPath: string
}

export type Config = {
  paths: PathConfig[]
  localesExtensions?: string
  localesNames?: string
  ignorePaths?: string[]
  excludeKey?: string | string[]
  scopedNames: string[]
}
