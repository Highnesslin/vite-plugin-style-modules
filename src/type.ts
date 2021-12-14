import type { Plugin } from 'postcss'

type GenerateScopedNameFunction = (
  name: string,
  filename: string,
  css: string
) => string

type LocalsConventionFunction = (
  originalClassName: string,
  generatedClassName: string,
  inputFile: string
) => string

declare class Loader {
  constructor(root: string, plugins: Plugin[])

  fetch(
    file: string,
    relativeTo: string,
    depTrace: string
  ): Promise<{ [key: string]: string }>

  finalSource?: string | undefined
}

export interface IPostCssModule {
  getJSON?(
    cssFilename: string,
    json: { [name: string]: string },
    outputFilename?: string
  ): void

  localsConvention?:
    | 'camelCase'
    | 'camelCaseOnly'
    | 'dashes'
    | 'dashesOnly'
    | LocalsConventionFunction

  scopeBehaviour?: 'global' | 'local'
  globalModulePaths?: RegExp[]

  generateScopedName?: string | GenerateScopedNameFunction

  hashPrefix?: string
  exportGlobals?: boolean
  root?: string

  Loader?: typeof Loader

  resolve?: (file: string) => string | Promise<string>
}

export interface IPluginOptions extends IPostCssModule {
  path: RegExp
}
