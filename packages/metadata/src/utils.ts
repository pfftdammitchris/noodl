import * as u from '@jsmanifest/utils'
import * as nu from 'noodl-utils'
import {
  Document,
  Scalar,
  Pair,
  YAMLMap,
  YAMLSeq,
  isScalar,
  isPair,
  isMap,
  isSeq,
  visit as visitFn,
} from 'yaml'

export function logError(error: unknown) {
  if (error instanceof Error) {
    console.error(
      `[${u.yellow(error.name)}] ${u.red(error.message)}`,
      '\n' + error.stack?.split('\n').slice(1).join('\n'),
    )
  } else {
    console.error(new Error(String(error)))
  }
}

export function purgeRootConfig(
  rootConfig: Document | Document.Parsed,
  replacer: (str: string) => string = nu.createNoodlPlaceholderReplacer({
    cadlBaseUrl: rootConfig.get('cadlBaseUrl'),
    cadlVersion: rootConfig.getIn(['web', 'cadlVersion', 'test']),
    designSuffix: rootConfig.get('designSuffix'),
  }),
) {
  visitFn(rootConfig, function visitRootConfig(key, node, path) {
    if (
      isScalar(node) &&
      u.isStr(node.value) &&
      nu.hasNoodlPlaceholder(node.value)
    ) {
      node.value = replacer(node.value)
    }
  })
  return rootConfig
}

export const is = {
  scalar: {
    nboolean: (node: Scalar) =>
      u.isBool(node.value) || node.value === 'true' || node.value === 'false',
    value: <V = any>(node: Scalar, value: any): value is V =>
      node.value === value,
  },
  pair: {
    key: {
      eq: (node: Pair, value: string) =>
        isScalar(node.key) && node.key.value === value,
      startsWith: <S extends string, V = unknown>(
        node: Pair,
        value: S,
      ): node is Pair<Scalar<`${S}${string}`>, V> =>
        isScalar(node.key) &&
        u.isStr(node.key.value) &&
        node.key.value.startsWith(value),
    },
  },
  map: {
    has: {
      allKeys: (node: YAMLMap, ...keys: string[]) =>
        keys.every((key) => node.has(key)),
      anyKey: (node: YAMLMap, ...keys: string[]) =>
        keys.some((key) => node.has(key)),
    },
    empty: (node: YAMLMap) => node.items.length === 0,
    single: (node: YAMLMap) => node.items.length === 1,
  },
  seq: {
    has: {
      valueAt: (node: YAMLSeq, index: number, value: any) =>
        node.get(index) === value,
    },
    empty: (node: YAMLSeq) => node.items.length === 0,
    single: (node: YAMLSeq) => node.items.length === 1,
  },
  noodl: {
    action: (node: YAMLMap): node is YAMLMap<'actionType'> =>
      node.has('actionType'),
    component: (node: YAMLMap): node is YAMLMap<'type'> => node.has('type'),
  },
}

export function throwError(err: unknown) {
  if (err instanceof Error) throw err
  throw new Error(String(err))
}

export function getSuccessResponse(
  body?: Record<string, any>,
  options?: Record<string, any>,
) {
  return {
    statusCode: 200,
    body: body ? JSON.stringify(body, null, 2) : '',
    ...options,
  }
}

export function getErrorResponse(
  error: unknown,
  options?: Record<string, any>,
) {
  return {
    statusCode: 500,
    body: JSON.stringify(
      error instanceof Error
        ? {
            name: error.name,
            message: error.message,
            ...(process.env.NODE_ENV === 'development'
              ? { stack: error.stack }
              : undefined),
          }
        : { name: 'Error', message: String(error) },
      null,
      2,
    ),
    ...options,
  }
}

export const tsm = {
  /**
   * @param { InstanceType<Scalar> } node
   */
  getLazyTypeAliasType: (node) => {
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
