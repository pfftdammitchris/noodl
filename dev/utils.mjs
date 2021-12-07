import yaml from 'yaml'
import * as u from '@jsmanifest/utils'

const {
  isNode,
  isScalar,
  isPair,
  isMap,
  isSeq,
  Node: YAMLNode,
  Document: YAMLDocument,
  YAMLMap,
  YAMLSeq,
  Pair,
  Scalar,
  visit,
} = yaml

/**
 * @typedef { ReturnType<typeof getJsType> } JsType
 * @typedef { import('yaml').Node } YAMLNode
 */

/**
 * @param { YAMLNode } value
 */
export function getJsType(value) {
  if (isNode(value)) {
    if (isScalar(value)) return value === 'null' ? 'null' : typeof value
    if (isPair(value)) return 'key-value'
    if (isMap(value)) return 'object'
    if (isSeq(value)) return 'array'
  }
  return value === 'null' ? 'null' : u.isArr(value) ? 'array' : typeof value
}

/**
 * @param { YAMLNode } value
 */
export function getYamlType(value) {
  if (isNode(value)) {
    if (isScalar(value)) return 'scalar'
    if (isPair(value)) return 'pair'
    if (isMap(value)) return 'map'
    if (isSeq(value)) return 'seq'
  }
}

/**
 * @param { InstanceType<typeof YAMLMap> } node
 */
export function getMapProperties(node) {
  return node.items.map((item) => String(item.key))
}

export const tsm = {
  /**
   * @param { InstanceType<Scalar> } node
   */
  getNodeScalarTypeAliasType: (node) => {
    const type = typeof node.value
    switch (type) {
      case 'boolean':
      case 'number':
      case 'string':
        return type
      case 'function':
        return `(...args: any[]) => any`
      case 'object':
        return `Record<string, any>`
      default:
        if (u.isArr(node.value)) return `any[]`
        return 'any'
    }
  },
}

export function pascalCase(str = '') {
  return str
    .split(' ')
    .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
    .join('')
}
