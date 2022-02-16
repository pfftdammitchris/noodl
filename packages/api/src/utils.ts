import flowRight from 'lodash/flowRight'
import * as u from '@jsmanifest/utils'
import type { LiteralUnion } from 'type-fest'
import y from 'yaml'
import * as t from './types/apiTypes'

export function isArr(node: unknown): node is y.YAMLSeq {
  return y.isSeq(node)
}

export function isBool(node: unknown): node is y.Scalar<boolean> {
  return y.isScalar(node) && u.isBool(node.value)
}

export function isObj(node: unknown): node is y.YAMLMap {
  return y.isMap(node)
}

export function isNum(node: unknown): node is y.Scalar<number> {
  return y.isScalar(node) && u.isNum(node.value)
}

export function isStr(node: unknown): node is y.Scalar<string> {
  return y.isScalar(node) && u.isStr(node.value)
}

export function invokeIfMap(fn: (node: y.YAMLMap) => y.YAMLMap | null | void) {
  return function isMap(node: unknown) {
    if (y.isMap(node)) return fn(node)
    return node
  }
}

export function invokeIfSeq(fn: (node: y.YAMLSeq) => y.YAMLSeq | null | void) {
  return function isSeq(node: unknown) {
    if (y.isSeq(node)) return fn(node)
    return node
  }
}

export function compose<N>(...fns: ((node: N) => void)[]) {
  const composed = flowRight(...fns)
  return (node: N) => {
    composed(node)
    return node
  }
}

function createKeyCallback(...keys: string[]) {
  return (fn) => (node) => {
    return (node: y.YAMLMap) => {}
  }
}

function composeKeyCallers(composed) {
  return (...keys: string[]) => {
    return (node: y.YAMLMap) =>
      keys.forEach((key) => hasKeys(key, node) && composed(node))
  }
}

export function hasKeys<S extends string>(
  keys: S | S[],
  node: y.YAMLMap,
): node is y.YAMLMap<LiteralUnion<S, string>, any> {
  return y.isMap(node) && u.array(keys).every((key) => node.has(key))
}

export function isActionObject(
  node: y.YAMLMap,
): node is y.YAMLMap<LiteralUnion<'actionType', string>, any> {
  return hasKeys('actionType', node)
}
