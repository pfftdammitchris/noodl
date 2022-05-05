import y from 'yaml'
import { Value } from './constants'
import type Store from './Store'

export type LogLevel = 'debug' | 'error' | 'info' | 'verbose' | 'warn'

export interface ObjectMeta {
  keys?: {
    [key: string]: {
      type?: Value
      children?: any[]
    }
  }
}

export interface PropertyMeta<K extends string, V = any> {
  key: K
  value?: V
  pageNames: string[]
  typeOccurrences: {
    array?: PropertyTypeOccurrence
    boolean?: PropertyTypeOccurrence
    object?: PropertyTypeOccurrence
    number?: PropertyTypeOccurrence
    null?: PropertyTypeOccurrence
    string?: PropertyTypeOccurrence
    undefined?: PropertyTypeOccurrence
  }
}

export interface PropertyTypeOccurrence {
  config: string | null
  pages: {
    [name: string]: {
      occurrences: number
      values?: any[]
    }
  }
  total: number
}

export interface PluginObject {
  id?: string
  keys?: {
    [key: string]: {
      nullable?: boolean
      type?: Value
    }
  }
  init?: (store: Store) => void
  any?: VisitorFn<
    unknown,
    {
      type:
        | 'Alias'
        | 'Collection'
        | 'Document'
        | 'Map'
        | 'Seq'
        | 'Pair'
        | 'Scalar'
    }
  >[]
  Alias?: VisitorFn<y.Alias>[]
  Collection?: VisitorFn<y.YAMLMap | y.YAMLSeq>[]
  Map?: VisitorFn<y.YAMLMap>[]
  Node?: VisitorFn<y.Alias | y.Scalar | y.YAMLMap | y.YAMLSeq>[]
  Pair?: VisitorFn<y.Pair>[]
  Scalar?: VisitorFn<y.Scalar>[]
  Seq?: VisitorFn<y.YAMLSeq>[]
}

export interface VisitFnParamsObject<N = unknown> {
  key: Parameters<y.visitorFn<N>>[0]
  node: Parameters<y.visitorFn<N>>[1]
  path: Parameters<y.visitorFn<N>>[2]
}

export interface VisitorFn<
  N = unknown,
  Opts extends Record<string, any> = Record<string, any>,
> {
  (args: VisitFnParamsObject<N> & { store: Store } & Opts):
    | ReturnType<y.visitorFn<N>>
    | ReturnType<y.asyncVisitorFn<N>>
}
