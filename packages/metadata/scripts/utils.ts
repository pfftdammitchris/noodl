import curry from 'lodash/curry'
import flowRight from 'lodash/flowRight'
import * as u from '@jsmanifest/utils'
import * as nc from 'noodl-common'
import * as nt from 'noodl-types'
import * as nu from 'noodl-utils'
import NoodlAggregator from 'noodl-aggregator'
import {
  Document,
  Scalar,
  Pair,
  Node as YAMLNode,
  YAMLMap,
  YAMLSeq,
  isDocument,
  isScalar,
  isPair,
  isMap,
  isSeq,
  visit as visitFn,
  visitor,
  visitorFn,
} from 'yaml'
import fs from 'fs-extra'
import path from 'path'
import axios from 'axios'
import chalk from 'chalk'

export interface VisitArgs<T> {
  doc: Document | Document.Parsed
  key: Parameters<visitorFn<T>>[0]
  node: Parameters<visitorFn<T>>[1]
  path: Parameters<visitorFn<T>>[2]
}

export interface VisitFn<T = YAMLNode> {
  (args: VisitArgs<T>): ReturnType<visitorFn<T>>
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
    actionType: (node: Scalar): node is Scalar<'actionType'> => {
      return node.value === 'actionType'
    },
  },
  pair: {
    actionType: (node: Pair): node is Pair<'actionType', Scalar<string>> => {
      return isScalar(node.key) && is.scalar.actionType(node.key)
    },
  },
  map: {
    action: (node: YAMLMap): node is YAMLMap<'actionType'> => {
      return node.has('actionType')
    },
    emit: (node: YAMLMap): node is YAMLMap<'emit'> => {
      return node.has('emit')
    },
    goto: (node: YAMLMap): node is YAMLMap<'goto'> => {
      return node.has('goto')
    },
  },
  seq: {},
}

export const visit = curry(
  (
    options: {
      actionType?(args: VisitArgs<Scalar<string>>): void
      actionObject?(args: VisitArgs<YAMLMap<'actionType'>>): void
      componentType?(args: VisitArgs<Scalar<string>>): void
      componentObject?(
        args: VisitArgs<YAMLMap<'type' | 'children' | 'style'>>,
      ): void
      emit?(args: VisitArgs<YAMLMap<'emit'>>): void
      goto?(args: VisitArgs<YAMLMap<'goto'>>): void
      if?(args: VisitArgs<YAMLMap<'if'>>): void
      reference?(node: VisitArgs<Scalar<nt.ReferenceString>>): void
    },
    doc: Document | Document.Parsed,
  ) => {
    const scalarFns = u.entries({
      actionType: options.actionType,
      componentType: options.componentType,
      reference: options.reference,
    })

    const mapFns = u.entries({
      actionObject: options.actionObject,
      componentObject: options.componentObject,
      emit: options.emit,
      goto: options.goto,
      if: options.if,
    })

    visitFn(doc, {
      Scalar(key, node, path) {
        for (const [name, fn] of scalarFns) {
          if (is.scalar[name] && is.scalar[name](node)) {
            fn({ doc, key, node, path })
          }
        }
      },
      Pair(key, node, path) {
        //
      },
      Map(key, node, path) {
        for (const [name, fn] of mapFns) {
          if (is.map[name] && is.map[name](node)) {
            fn({ doc, key, node, path })
          }
        }
      },
      Seq(key, node, path) {
        //
      },
    })
  },
)
