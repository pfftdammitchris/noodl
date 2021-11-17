import curry from 'lodash-es/curry.js'
import type { LiteralUnion } from 'type-fest'
import * as nt from 'noodl-types'
import yaml from 'yaml'
import type { YAMLDocument, visitorFn } from './internal/yaml.js'
import * as t from './types'

const is = nt.Identify

export interface VisitArgs<N = any> {
  key: t.YAMLVisitArgs<N>[0]
  node: t.YAMLVisitArgs<N>[1]
  path: t.YAMLVisitArgs<N>[2]
  name: string
  doc: N
  store: Store
  root: Root
}

export interface VisitFn<N = any> {
  (args: VisitArgs<N>): ReturnType<visitorFn<N>>
}

export interface Store {
  [key: string]: any
}

export type Root<K extends string = string> = Record<
  LiteralUnion<K, string>,
  any
>

const Visitor = curry(
  <K extends string = string>(
    store: Store,
    root: Root<K>,
    fn: VisitFn,
    name: string,
    doc: YAMLDocument,
  ) => {
    return yaml.visit(
      doc,
      (...[key, node, path]: Parameters<visitorFn<any>>) => {
        return fn({ key, node, path, name, doc, root, store })
      },
    )
  },
)

export default Visitor
