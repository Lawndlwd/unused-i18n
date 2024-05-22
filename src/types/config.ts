export interface PathConfig {
  srcPath: string
  localPath: string
}

export interface Config {
  paths: PathConfig[]
  localesExtensions?: string
  localeNameResolver?: (localeName: string) => string
  ignorePaths?: string[]
  excludeKey?: string | string[]
}
