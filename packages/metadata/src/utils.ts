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
import * as t from './Metadata/types.js'

export const createVisitor = function (visitor: t.Visitor<any, any>) {
  if (u.isFnc(visitor)) {
    return { Node: visitor }
  }
  return u.reduce(
    u.entries(visitor),
    (acc, [key, fn]) => u.assign(acc, { [key]: fn }),
    {} as t.VisitorMapping,
  )
}

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

function onScalar<RT>(fn: (node: Scalar) => any) {
  return (node: unknown): node is Scalar<RT> => isScalar(node) && fn(node)
}

function onPair<K = any, V = any>(fn: (node: Pair) => any) {
  return (node: unknown): node is Pair<K, V> => isPair(node) && fn(node)
}

function onMap<K = any, V = any>(fn: (node: YAMLMap) => any) {
  return (node: unknown): node is YAMLMap<K, V> => isMap(node) && fn(node)
}

function onSeq(fn: (node: YAMLSeq) => any) {
  return <V = any>(node: unknown): node is YAMLSeq<V> => isSeq(node) && fn(node)
}

export const is = {
  scalar: {
    actionType: onScalar<'actionType'>((node) => node.value === 'actionType'),
  },
  pair: {
    actionType: onPair<'actionType'>(
      (node) => isScalar(node.key) && node.key.value === 'actionType',
    ),
  },
  map: {
    action: onMap<'actionType'>((node) => node.has('actionType')),
    component: onMap<'type' | 'style' | 'children'>(
      (node) => node.has('type') && (node.has('style') || node.has('children')),
    ),
    emit: onMap<'emit'>((node) => node.has('emit')),
    goto: onMap<'goto'>((node) => node.has('goto')),
  },
  seq: {},
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
