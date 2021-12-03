import * as nt from 'noodl-types'
import yaml from 'yaml'
import type { LiteralUnion } from 'type-fest'
import type { OrArray } from '@jsmanifest/typefest'
import type { YAMLNode, visitorFn } from './internal/yaml'

export type YAMLVisitArgs<N> = Parameters<visitorFn<N>>

export interface ILoader<
  DataType extends Loader.RootDataType = Loader.RootDataType,
> {
  root: Loader.Root<DataType>
  options: Loader.Options<string, DataType>
}

export interface BaseStructure {
  ext: string
  filename: string
  group:
    | 'config'
    | 'document'
    | 'image'
    | 'page'
    | 'script'
    | 'video'
    | 'unknown'
}

export interface FileStructure extends BaseStructure {
  dir: string
  filepath: string
  rootDir: string
}

export interface LinkStructure extends BaseStructure {
  isRemote: boolean
  url: string
}

export type LoadType = 'doc' | 'json' | 'yml'
export type LoadFilesAs = 'list' | 'map' | 'object'

export interface LoadFilesOptions<
  LType extends LoadType = 'yml',
  LFType extends LoadFilesAs = 'list',
> {
  as?: LFType
  includeExt?: boolean
  preload?: OrArray<string>
  spread?: OrArray<string>
  type?: LType
}

export interface MetaObject<N = any> {
  _node?: N
  key?: string
  value?: any
  length?: number
  keys?: string[]
  isReference?: boolean
  isRootKey?: boolean
}

export interface Root {
  [key: string]: YAMLNode | null | undefined
}

export namespace Loader {
  export type CommonEmitEvents =
    | 'PARSED_APP_CONFIG'
    | 'RETRIEVED_ROOT_BASE_URL'
    | 'ON_RETRIEVED_ROOT_CONFIG'
    | 'RETRIEVED_APP_ENDPOINT'
    | 'RETRIEVED_APP_BASE_URL'
    | 'ON_RETRIEVED_APP_PAGE'
    | 'RETRIEVED_CONFIG_VERSION'

  export type Hooks = {
    ON_APP_PAGE_DOESNT_EXIST: { args: { name: string; error: Error } }
    ON_CONFIG_KEY: { args: string }
    ON_CONFIG_VERSION: { args: string }
    ON_PLACEHOLDER_PURGED: { args: { before: string; after: string } }
    ON_RETRIEVING_APP_CONFIG: { args: { url: string } }
    ON_RETRIEVED_APP_CONFIG: { args: string }
    ON_RETRIEVED_APP_PAGE: {
      args: {
        name: string
        doc: yaml.Document | Record<string, any>
        fromDir?: boolean
      }
    }
    ON_RETRIEVE_APP_PAGE_FAILED: { args: { name: string; error: Error } }
    ON_RETRIEVING_ROOT_CONFIG: { args: { url: string } }
    ON_RETRIEVED_ROOT_CONFIG: {
      args: {
        doc: yaml.Document | Record<string, any>
        name: string
        yml: string
      }
    }
  } & Record<
    CommonEmitEvents,
    { args: { name: string; doc: yaml.Document | Record<string, any> } }
  >

  export type LoadOptions<Type extends 'doc' | 'yml' = 'doc' | 'yml'> =
    | string
    | (Type extends 'doc'
        ? OrArray<{ name: string; doc: yaml.Document }>
        : OrArray<{ name: string; yml: string }>)

  export interface Options<
    ConfigKey extends string = string,
    DataType extends Loader.RootDataType = 'map',
  > {
    config?: ConfigKey
    dataType?: DataType
    deviceType?: nt.DeviceType
    env?: nt.Env
    loglevel?: 'error' | 'debug' | 'http' | 'info' | 'verbose' | 'warn'
    version?: LiteralUnion<'latest', string>
  }

  export type BaseRootKey = 'Global' | 'BaseCSS' | 'BaseDataModel' | 'BasePage'

  export type Root<DataType extends RootDataType = 'map'> =
    DataType extends 'object'
      ? Record<LiteralUnion<BaseRootKey, string>, any>
      : Map<LiteralUnion<BaseRootKey, string>, yaml.Node | yaml.Document> & {
          toJSON(): Record<string, any>
        }

  export type RootDataType = 'object' | 'map'
}
