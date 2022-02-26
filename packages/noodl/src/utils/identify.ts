import * as u from '@jsmanifest/utils'
import curry from 'lodash/curry'
import partial from 'lodash/partial'
import partialRight from 'lodash/partialRight'
import y from 'yaml'
import isNodeTypeOfValue from './isNodeTypeOfValue'
import isValueTypeOfNode from './isValueTypeOfNode'
import typeOf, { Type } from './typeOf'

/**
 * Supports YAML node + regular arrays/object literals
 */
const getValue = <
  N extends y.Node | y.Document | y.Pair | any[] | Record<string, any>,
  K extends string = string,
>(
  key: K,
  node: N,
): N extends y.YAMLMap
  ? y.Pair<K, any>
  : N extends Record<string, any>
  ? N[K]
  : any => {
  if (y.isMap(node) || y.isSeq(node)) return node.get(key, true) as any
  if (y.isPair(node)) node.value
  if (u.isArr(node)) return node[node.indexOf(key)]
  if (u.isObj(node)) return node[key as any]
  return node
}

/**
 * Supports YAML node + regular arrays/object literals
 */
const hasKey = curry<
  y.YAMLMap | y.YAMLSeq | y.Pair | any[] | Record<string, any>,
  string | string[],
  boolean
>((node, ...keys) => {
  if (y.isMap(node) || y.isSeq(node)) return keys.every((k) => node.has(k))
  if (y.isPair(node)) return keys.every((k) => node.key == k)
  if (y.isNode(node)) return false
  if (u.isArr(node)) return keys.every((k) => node.includes(k))
  if (u.isObj(node)) return keys.every((k) => (k as string) in node)
  return false
})

const onHasKey = curry<
  (node: any) => any,
  y.YAMLMap | y.YAMLSeq | y.Pair | any[] | Record<string, any>,
  string | string[],
  void
>((cb, node, keys) => {
  if (!u.isArr(keys)) keys = u.array(keys)
  if (y.isMap(node) || y.isSeq(node)) {
    keys.forEach((k) => node.has(k) && cb(node))
  } else if (y.isPair(node)) {
    keys.forEach((k) => node.key == k && cb(node))
  } else if (u.isArr(node)) {
    keys.every((k) => node.includes(k) && cb(node))
  } else if (u.isObj(node)) {
    keys.forEach((k) => (k as string) in node && cb(node))
  }
})

export function hasTwoOrMoreKeys(
  node: y.YAMLMap | y.YAMLSeq | y.Pair | any[] | Record<string, any>,
  ...keys: string[]
) {
  let count = 0
  onHasKey(() => void count++, node, keys)
  console.log({ count })
  return count >= 2
}

/**
 * @example
 * ```js
 * const map = createMap({ style: { textAlign: 'center' } })
 * const node = map.get('style')
 * if (node.has('textAlign')) {
 *    //
 * }
 * ```
 * @param { y.YAMLMap } node
 * @param { string } key
 * @param { string[] } innerKeys
 * @returns { boolean }
 */
const isKeyOfObjectContainKeys = <K extends string>(
  node: y.YAMLMap<K>,
  key: K,
  ...innerKeys: string[]
) => {
  if (!hasKey(node, key)) return false
  const innerObject = node.get(key)
  return y.isMap(innerObject) ? innerKeys.every(hasKey(innerObject)) : false
}

/**
 * @example
 * ```js
 * const map = createMap({ style: { textAlign: 'center' } })
 * const node = map.get('style')
 * if (node.has('textAlign')) {...}
 * Supports YAML node + regular arrays/object literals
 */
export const isObjectContaining = (
  opts: Record<string, any>,
  node: y.Node | y.Pair | Record<string, any>,
) => {
  for (const [key, value] of u.entries(opts)) {
    if (value instanceof KeyQuery) {
      if (value.types) {
        let val = getValue(key, node)
        if (y.isScalar(val)) val = val.value
        if (val === undefined) return false
        if (val === null && value.types.includes('null')) return true
        return value.types.some((type) => {
          let v = getValue(key, node)
          if (y.isScalar(v)) v = v.value
          return isNodeTypeOfValue(getValue(key, node), type)
        })
      }
    } else {
      let val = getValue(key, node)
      if (y.isScalar(val)) val = val.value
      if (val !== value) return false
    }
  }
  return true
}

export class KeyQuery {
  types?: Type[]

  constructor(types: Type[] | { type?: Type })
  constructor(opts: {
    type?: 'array' | 'object' | 'function' | 'string' | 'number' | 'null'
  }) {
    if (u.isArr(opts)) {
      this.types = opts
    } else {
      if (opts.type) this.types = [opts.type]
    }
  }
}

const createIdentifyNode = <
  N extends
    | Record<string, any>
    | any[]
    | y.Node
    | y.Pair
    | string
    | number
    | null
    | boolean,
  R,
>(
  type: string,
) => {
  return (fn: (node: N) => R) => (node: unknown) => {
    switch (type) {
      case 'Scalar':
        return y.isScalar(node) && fn(node as N)
      case 'Pair':
        return y.isPair(node) && fn(node as N)
      case 'Map':
        return y.isMap(node) && fn(node as N)
      case 'Seq':
        return y.isSeq(node) && fn(node as N)
      case 'array':
        return u.isArr(node) && fn(node as N)
      case 'object':
        return u.isObj(node) && fn(node as N)
      case 'boolean':
        return u.isBool(node) && fn(node as N)
      case 'string':
        return u.isStr(node) && fn(node as N)
      case 'number':
        return u.isNum(node) && fn(node as N)
      case 'null':
        return u.isNull(node) && fn(node as N)
      default:
        return false
    }
  }
}

const idScalar = createIdentifyNode<y.Scalar, boolean>('Scalar')
const idPair = createIdentifyNode<y.Pair, boolean>('Pair')
const idMap = createIdentifyNode<y.YAMLMap, boolean>('Map')
const idSeq = createIdentifyNode<y.YAMLSeq, boolean>('Seq')
const idArr = createIdentifyNode<any[], boolean>('array')
const idObj = createIdentifyNode<Record<string, any>, boolean>('object')

export const isActionTypeStr = idScalar((node) => node.value === 'actionType')

export const isActionObject = idMap(partialRight(hasKey, 'actionType'))
export const isComponentObject = idMap(partialRight(hasKey, 'type'))
export const isPageObject = idMap(partialRight(hasKey, 'components'))

export const isApiObject = idMap(partialRight(hasKey, 'api', 'dataIn'))
export const isGotoObject = idMap(partialRight(hasKey, 'goto'))
export const isEmitObject = idMap(partialRight(hasKey, 'emit'))
export const isReqOptions = idMap(partialRight(hasKey, 'emit'))

// export const isActionTypeObject =
