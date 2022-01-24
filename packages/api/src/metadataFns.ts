import * as u from '@jsmanifest/utils'
import * as nt from 'noodl-types'
import curry from 'lodash/curry'
import merge from 'lodash/merge'
import mergeWith from 'lodash/mergeWith'
import y from 'yaml'
import * as t from './types/graphqlTypes'
import * as util from './utils'
import type { visitor as YAMLVisitor } from 'yaml'
import type { ApiVisitorFn, ApiVisitorMap } from './types/apiTypes'

process.stdout.write('\x1Bc')
const is = nt.Identify

export interface MetadataFn<S extends Record<string, any>> {
  (store: S & Record<string, any>): ApiVisitorFn | ApiVisitorMap
}

export const createMetadataFn = <S extends Record<string, any>>(
  fn: MetadataFn<S>,
) => {
  return (store: S & Record<string, any>) => {
    const getMetadata = fn(store)

    if (u.isFnc(getMetadata)) {
      return curry(
        (args: {
          page: string
          key: number | 'key' | 'value'
          node: unknown
          path: (y.Node | y.Document | y.Pair)[]
        }) => {
          getMetadata(args)
          return args
        },
      )
    } else {
      return getMetadata
    }
  }
}

export const scalarFns = {}
export const pairFns = {
  actionTypes: createMetadataFn<{ actionTypes: string[] }>((store) => {
    store.actionTypes = []
    return ({ node }) => {
      if (
        y.isPair(node) &&
        y.isScalar(node.key) &&
        node.key.value === 'actionType'
      ) {
        const actionType = String(node.value)
        if (!store.actionTypes.includes(actionType)) {
          store.actionTypes.push(actionType)
        }
      }
    }
  }),
  componentTypes: createMetadataFn<{ componentTypes: string[] }>((store) => {
    store.componentTypes = []
    return ({ node, path }) => {
      if (y.isPair(node) && y.isScalar(node.key) && node.key.value === 'type') {
        const prev = path[path.length - 1]
        if (y.isMap(prev) && util.hasKeys('style', prev)) {
          const componentType = String(prev.get('type'))
          if (!store.componentTypes.includes(componentType)) {
            store.componentTypes.push(componentType)
          }
        }
      }
    }
  }),
}
export const seqFns = {}
export const mapFns = {
  // handleActionObjects: createMapFn((store) => {
  //   store.actions = {}
  //   const results = {} as {
  //     [actionType: string]: {
  //       occurrences: number
  //       properties?: {
  //         [property: string]: t.PropertyMetadata[]
  //       }
  //     }
  //   }
  //   function getOrCreatePropertyMeta(
  //     property: unknown | string | number | y.Scalar,
  //   ) {
  //     let key: string | number = ''
  //     if (!property) return null
  //     if (y.isScalar(property)) key = property.value as any
  //     if (u.isStr(property) || u.isNum(property)) key = property
  //     if (!results[key]) {
  //       results[key] = {
  //         occurrences: 0,
  //       }
  //     }
  //     return results[key]
  //   }
  //   function getTrigger(
  //     path: (y.Node | y.Document<unknown> | y.Pair<unknown, unknown>)[],
  //   ) {
  //     const node = path[path.length - 1]
  //     if (y.isPair(node)) return node.key
  //     if (node) {
  //       path = [...path]
  //       path.pop()
  //       return getTrigger(path)
  //     }
  //     return null
  //   }
  //   function formatPropertyMeta(
  //     property: string,
  //     propertyMeta: t.PropertyMetadata,
  //   ) {
  //     return { value: property, ...propertyMeta }
  //   }
  //   function formatMetaObject(
  //     actionType = '',
  //     metaObj: Pick<t.ActionTypesQueryItem, 'occurrences'> & {
  //       properties?: Record<string, t.PropertyMetadata[]>
  //     },
  //   ) {
  //     return {
  //       actionType,
  //       ...metaObj,
  //       properties: u.reduce(
  //         u.entries(metaObj.properties),
  //         (acc, [property, propertyMeta]) => {
  //           return acc.concat(
  //             propertyMeta.map((meta) => formatPropertyMeta(property, meta)),
  //           )
  //         },
  //         [],
  //       ),
  //     }
  //   }
  //   return (page, key, node, path) => {
  //     if (node.has('actionType')) {
  //       const actionType = String(node.get('actionType'))
  //       const metaObj = getOrCreatePropertyMeta(actionType)
  //       for (const item of node.items) {
  //         let { key, value } = item
  //         if (y.isScalar(key)) {
  //           if (u.isStr(key.value) && key.value !== 'actionType') {
  //             const isReference = is.reference(key.value)
  //             const propertyObj = {
  //               key,
  //               value,
  //               isReference,
  //               page: page,
  //               trigger: getTrigger(path),
  //             } as t.PropertyMetadata
  //             if (!metaObj.properties) metaObj.properties = {}
  //             if (!metaObj.properties[key.value]) {
  //               metaObj.properties[key.value] = []
  //             }
  //             metaObj.properties[key.value].push(propertyObj)
  //           }
  //         }
  //       }
  //     }
  //     // mergeWith(
  //     //   store.actions as {
  //     //     [actionType: string]: {
  //     //       occurrences: number
  //     //       properties?: {
  //     //         [property: string]: t.PropertyMetadata[]
  //     //       }
  //     //     }
  //     //   },
  //     //   results,
  //     //   // u.reduce(
  //     //   //   u.entries(results),
  //     //   //   (acc, [actionType, metaObj]) =>
  //     //   //     acc.concat(formatMetaObject(actionType, metaObj)),
  //     //   //   [] as ReturnType<typeof formatMetaObject>[],
  //     //   // ),
  //     //   (value, srcValue, key, object, source, stack) => {
  //     //     console.dir(
  //     //       // `[mergeWith] key: ${key}`,
  //     //       {
  //     //         value,
  //     //         srcValue,
  //     //         object,
  //     //         source,
  //     //         stack: stack.__data__.__data__,
  //     //       },
  //     //       { depth: Infinity },
  //     //     )
  //     //     return undefined
  //     //   },
  //     // )
  //     merge(
  //       store.actions,
  //       u.reduce(
  //         u.entries(results),
  //         (acc, [actionType, metaObj]) =>
  //           acc.concat(formatMetaObject(actionType, metaObj)),
  //         [] as ReturnType<typeof formatMetaObject>[],
  //       ),
  //     )
  //   }
  // }),
}
