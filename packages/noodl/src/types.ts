import * as nt from 'noodl-types'
import y from 'yaml'
import type { LiteralUnion } from 'type-fest'
import type { OrArray } from '@jsmanifest/typefest'
import type { visitorFn } from './internal/yaml'
import * as c from './constants'

export abstract class AExtractor<INode = any> {
  abstract extract(data: Record<string, INode>): any[]
  abstract use(
    value: AIterator<any> | Accumulator | AVisitor | AStructure,
  ): this
}

export abstract class Accumulator<Acc = any> {
  abstract init(): Acc
  abstract reduce(acc: Acc, name: string, result: any): Acc
}

export interface IAccumulator<V = any> {
  value: V
}

export interface ILoader<
  DataType extends Loader.RootDataType = Loader.RootDataType,
> {
  root: Loader.Root<DataType>
  options: Loader.Options<string, DataType>
}

export abstract class AStructure<Struct extends IStructure = IStructure> {
  abstract name: string
  abstract is(node: any): boolean
  abstract createStructure(node: any): Struct
}

export interface IStructure<S extends string = string> {
  raw: any
  group: S
}

export abstract class AVisitor {
  abstract visit(name: string, node: any): any
  abstract use(
    callback: (args: {
      name?: string
      key: any
      value: any
      path: any[]
    }) => any,
  ): this
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
      appConfig: T extends 'map' ? y.Document : nt.AppConfig
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
      rootConfig: T extends 'map' ? y.Document : nt.RootConfig
      url: string
      yml: string
    }): void
    [c.appConfigIsBeingRetrieved]<T extends Loader.RootDataType>(args: {
      rootConfig: T extends 'map' ? y.Document : nt.RootConfig
      appKey: string
      url: string
    }): void
    [c.appConfigRetrieved]<T extends Loader.RootDataType>(args: {
      appKey: string
      appConfig: T extends 'map' ? y.Document : nt.AppConfig
      rootConfig: T extends 'map' ? y.Document : nt.RootConfig
      yml: string
      url: string
    }): void
    [c.appPageRetrieved]<T extends Loader.RootDataType>(args: {
      fromDir?: boolean
      pageName: string
      pageObject: T extends 'map' ? y.Document : nt.PageObject
      url?: string
    }): void
    [c.appPageRetrieveFailed](args: { error: Error; pageName: string }): void
  }

  export type LoadOptions<Type extends 'doc' | 'yml' = 'doc' | 'yml'> =
    | string
    | (Type extends 'doc'
        ? OrArray<{ name: string; doc: y.Document }>
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
    y.Node | y.Document
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

export namespace Ext {
  export type Image = 'bmp' | 'gif' | 'jpg' | 'jpeg' | 'png' | 'webp'
  export type Script = 'js'
  export type Text = 'html' | 'css' | 'txt'
  export type Video = 'avi' | 'mkv' | 'mp4' | 'mpg' | 'mpeg' | 'flac'
}

export type YAMLNode = y.Node | y.Pair | y.Document
export type YAMLVisitArgs<N> = Parameters<visitorFn<N>>

export interface YAMLVisitorCallback<N = any> {
  (args: {
    data: Record<string, any>
    name?: string
    key: null | string | number
    value: N
    path: YAMLNode[]
  }):
    | number
    | y.Node
    | typeof y.visit.BREAK
    | typeof y.visit.REMOVE
    | typeof y.visit.SKIP
    | undefined
    | void
}
