import * as u from '@jsmanifest/utils'
import y from 'yaml'
import createScalar from './createScalar'
import createPair from './createPair'
import createMap from './createMap'
import createSeq from './createSeq'
import typeOf from './typeOf'

function createNode(value: unknown): y.Node | ((...args: any[]) => any)
function createNode(key: string, value: any): y.Pair
function createNode(arg1: unknown, arg2?: any) {
  if (arguments.length >= 2) return createNode(createPair(arg1 as string, arg2))

  const value = arg1
  const type = typeOf(value)

  let node: y.Node | y.Pair

  if (y.isPair(value)) {
    if (
      !y.isNode(value.value) &&
      !y.isPair(value.value) &&
      !u.isFnc(value.value)
    ) {
      value.value = createNode(value.value)
    }
    return value
  }

  if (type === 'array') {
    node = createSeq(value as any[])
    node.items = node.items.map((item) => createNode(item))
  } else if (type === 'object') {
    node = createMap(value) as y.YAMLMap
    if (node.items.length) {
      // @ts-expect-error
      node.items.forEach((pair: y.Pair) => {
        if (
          !y.isNode(pair.value) &&
          !y.isPair(pair.value) &&
          !u.isFnc(pair.value)
        ) {
          pair.value = createNode(pair.value)
        }
      })
    }
  } else if (type === 'function') {
    return value as (...args: any[]) => any
  } else {
    return createScalar(value)
  }

  return node
}

export default createNode
