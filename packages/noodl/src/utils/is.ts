import y from 'yaml'
import * as nt from 'noodl-types'
import * as u from '@jsmanifest/utils'
import regex from '../internal/regex'
import type { Ext } from '../types'

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

export function image<S extends string = string>(
  value: string,
): value is `${S}.${Ext.Image}` {
  return regex.image.test(value)
}

export function script<S extends string = string>(
  value: string,
): value is `${S}.${Ext.Script}` {
  return regex.script.test(value)
}

export function text<S extends string = string>(
  value: string,
): value is `${S}.${Ext.Text}` {
  return regex.text.test(value)
}

export function video<S extends string = string>(
  value: string,
): value is `${S}.${Ext.Video}` {
  return regex.video.test(value)
}

export function file<S extends string = string>(
  value: string,
): value is `${S}.${Ext.Image | Ext.Video}` {
  return regex.file.test(value)
}

export function promise<V = any>(value: unknown): value is Promise<V> {
  return value !== null && typeof value === 'object' && 'then' in value
}

export function ymlNode(
  value: unknown,
): value is y.Node | y.Pair | y.Document | y.Document.Parsed {
  return (
    value !== null &&
    typeof value === 'object' &&
    (y.isNode(value) || y.isPair(value) || y.isDocument(value))
  )
}

export function url(value: unknown): boolean {
  return typeof value === 'string' && regex.url.test(value)
}
