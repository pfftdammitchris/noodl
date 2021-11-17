import * as nt from 'noodl-types'
import { Loader } from 'noodl'
import {
  isDocument,
  isMap,
  isNode,
  isPair,
  isScalar,
  isSeq,
  YAMLMap,
  YAMLSeq,
  Pair,
  Scalar,
  Node as YAMLNode,
  Document as YAMLDocument,
  visit as YAMLVisit,
  visitorFn as YAMLVisitorFn,
} from 'yaml'

export type ReferenceType =
  | 'await'
  | 'evolve'
  | 'merge'
  | 'traverse'
  | 'tilde'
  | 'unknown'

export type Operator = 'await' | 'evolve' | 'merge' | 'traverse' | 'tilde'

export interface DataObject<V = any> {
  operator: Operator | Operator[]
  location:
    | 'init'
    | 'components'
    | 'save'
    | 'check'
    | 'update'
    | 'other'
    | 'unknown'
  page: string
  // value: DataObjectValue<V>
  value: any
  isActionChain: boolean | null
  isDataKey: boolean | null
  isKey: boolean | null
  isFunction: boolean | null
}

export interface DataObjectValue<V> {
  value: V
  references: any
}

export interface ParentInfoObject {
  child: PairKeyReferenceObject & { isReference: boolean }
}

export interface PairKeyReferenceObject {
  parent: ParentInfoObject
  reference: string
  isAwait: boolean
  isEvolve: boolean
  isMerge: boolean
}

export interface VisitFn<N = unknown> {
  (
    this: YAMLNode | YAMLDocument,
    args: {
      context: {
        name: string
        visitee: YAMLNode | YAMLDocument
        root: Loader['root']
      }
      key: Parameters<YAMLVisitorFn<N>>[0]
      node: Parameters<YAMLVisitorFn<N>>[1]
      path: Parameters<YAMLVisitorFn<N>>[2]
    },
  ): ReturnType<YAMLVisitorFn<N>>
}

export type VisitTransducerFn<N extends YAMLNode = YAMLNode> = (
  fn: VisitFn<N>,
) => (
  step: (
    acc: VisitFn<N>,
    args: Parameters<VisitFn<N>>[0],
  ) => (args: Parameters<VisitFn<N>>[0]) => VisitFn<N>,
) => any

/* -------------------------------------------------------
	---- BRAINSTORM
-------------------------------------------------------- */

export interface NoodlObject {
  [key: string]: any
}

export type NoodlString = string

export type NoodlReferenceString<S extends string = string> =
  nt.ReferenceString<S>

export type NoodlArray<O = any> = any[]

export interface NoodlPage extends NoodlObject {
  [name: string]: {
    components?: NoodlArray[]
  }
}

export type NoodlPageInit = NoodlArray

export interface NoodlFunction extends NoodlObject {
  (...args: any[]): void
}
