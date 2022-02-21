import y from 'yaml'
import * as nt from 'noodl-types'
import * as u from '@jsmanifest/utils'

export function typeOf(value: unknown) {
  if (u.isArr(value)) return 'array'
  if (value === null) return 'null'
  return typeof value
}

/* -------------------------------------------------------
  ---- YAMLMap
-------------------------------------------------------- */

export function builtInFn(
  node: y.YAMLMap,
): node is y.YAMLMap<nt.BuiltInEvalReference<string>> {
  return node.has('=.builtIn')
}
