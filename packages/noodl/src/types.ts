import * as nt from 'noodl-types'
import yaml from 'yaml'
import type { LiteralUnion } from 'type-fest'
import type { OrArray } from '@jsmanifest/typefest'
import type { YAMLNode, visitorFn } from './internal/yaml'
import * as c from './constants'

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
  raw: string
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
    | typeof c.appConfigParsed
    | typeof c.rootBaseUrlPurged
    | typeof c.rootConfigRetrieved
    | typeof c.appEndpointPurged
    | typeof c.appBaseUrlPurged
    | typeof c.appPageRetrieved
    | typeof c.configVersionSet

  export type Hooks = {
    [c.rootConfigRetrieved](options: {
      rootConfig: nt.RootConfig
      yml: string
    }): void
    [c.appConfigParsed]<T extends Loader.RootDataType>(args: {
      name: string
      appConfig: T extends 'map' ? yaml.Document : nt.AppConfig
    }): void
    [c.appPageNotFound](options: {
      appKey: string
      error: Error
      pageName: string
      url?: string
    }): void
    [c.configKeySet](configKey: string): void
    [c.configVersionSet](
      configVersion: LiteralUnion<'latest', string | number>,
    ): void
    [c.placeholderPurged](args: { before: string; after: string }): void
    [c.rootConfigIsBeingRetrieved]<T extends Loader.RootDataType>(args: {
      configKey: string
      configUrl: string
    }): void
    [c.rootConfigRetrieved]<T extends Loader.RootDataType>(args: {
      rootConfig: T extends 'map' ? yaml.Document : nt.RootConfig
      url: string
      yml: string
    }): void
    [c.appConfigIsBeingRetrieved]<T extends Loader.RootDataType>(args: {
      rootConfig: T extends 'map' ? yaml.Document : nt.RootConfig
      appKey: string
      url: string
    }): void
    [c.appConfigRetrieved]<T extends Loader.RootDataType>(args: {
      appKey: string
      appConfig: T extends 'map' ? yaml.Document : nt.AppConfig
      rootConfig: T extends 'map' ? yaml.Document : nt.RootConfig
      yml: string
      url: string
    }): void
    [c.appPageRetrieved]<T extends Loader.RootDataType>(args: {
      fromDir?: boolean
      pageName: string
      pageObject: T extends 'map' ? yaml.Document : nt.PageObject
      url?: string
    }): void
    [c.appPageRetrieveFailed](args: { error: Error; pageName: string }): void
  }

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

  export type BaseRootKey =
    | 'Config'
    | 'Global'
    | 'BaseCSS'
    | 'BaseDataModel'
    | 'BasePage'

  export type RootMap = Map<
    LiteralUnion<BaseRootKey, string>,
    yaml.Node | yaml.Document
  > & {
    toJSON(): Record<string, any>
  }

  export type RootObject = Record<LiteralUnion<BaseRootKey, string>, any>

  export type Root<DataType extends RootDataType = 'map'> =
    DataType extends 'object' ? RootObject : RootMap

  export type RootDataType = 'object' | 'map'
}

/* -------------------------------------------------------
  ---- PARSED TYPES
-------------------------------------------------------- */

export interface ParsedBuiltInEvalFn {
  key: ParsedNoodlString
  value: {
    dataIn?: any
    dataOut?: any
  }
}

export interface ParsedKeyPair {
  type: 'key-pair'
  key: ParsedNoodlString
  value: any
}

export type ParsedNoodlString<V = string> =
  | NoodlStringReference
  | NoodlString<V>

export type NoodlReference = NoodlStringReference

export interface NoodlStringReference {
  type: 'reference'
  kind: 'string'
  operators: (
    | AwaitOperator
    | EvalOperator
    | MergeOperator
    | TildeOperator
    | TraverseOperator
  )[]
  paths: NoodlStringReferenceItem[]
}

export interface NoodlObjectReference {
  type: 'reference'
  kind: 'object'
  key: ParsedNoodlString
  value: any
}

export interface NoodlStringReferenceItem<V = string> {
  value: V
}

export interface NoodlString<V = string> {
  type: 'string'
  value: V
}

export interface Operator {
  type: 'operator'
}

export interface AwaitOperator extends Operator {
  kind: 'await'
}

export interface EvalOperator extends Operator {
  kind: 'eval'
}

export interface MergeOperator extends Operator {
  kind: 'merge'
  location: 'local' | 'root'
}

export interface TildeOperator extends Operator {
  kind: 'tilde'
}

export interface TraverseOperator extends Operator {
  kind: 'traverse'
}
