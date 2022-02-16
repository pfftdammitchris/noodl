import * as u from '@jsmanifest/utils'
import * as nt from 'noodl-types'
import y from 'yaml'
import curry from 'lodash/curry'
import * as t from '../types/apiTypes'
import type { MetadataFn, ApiVisitorFn, ApiVisitorMap } from '../metadataFns'

export type Store = Record<string, any>

export default function createVisitorFactory<S extends Record<string, any>>(
  store: S & Store,
) {
  const visitors = {
    All: [] as ApiVisitorFn<any>[],
    Scalar: [] as ApiVisitorFn<y.Scalar>[],
    Pair: [] as ApiVisitorFn<y.Pair>[],
    Map: [] as ApiVisitorFn<y.YAMLMap>[],
    Seq: [] as ApiVisitorFn<y.YAMLSeq>[],
    Value: [] as ApiVisitorFn<y.YAMLSeq>[],
  }

  const createVisitor = (fn: MetadataFn<S>) => {
    const consumer = fn(store)

    if (u.isFnc(consumer)) {
      visitors.All.push(consumer)
    } else if (u.isObj(consumer)) {
      for (let [key, value] of u.entries(consumer)) {
        visitors[key]?.push?.(value)
      }
    }
  }

  const o = {
    createVisitor,
    emit: (type, ...args) => visitors[type]?.(...args),
  }

  return o
}
