import * as u from '@jsmanifest/utils'
import * as nu from 'noodl-utils'
import * as nt from 'noodl-types'
import flowRight from 'lodash/flowRight'
import NoodlAggregator from 'noodl'
import {
  Document,
  Scalar,
  Pair,
  YAMLMap,
  YAMLSeq,
  isDocument,
  isScalar,
  isPair,
  isMap,
  isSeq,
  visit,
  visitorFn,
} from 'yaml'
import fs from 'fs-extra'
import path from 'path'
import axios from 'axios'
import chalk from 'chalk'
import * as n from '../utils'
import * as t from './types'

const baseConfigUrl = 'https://public.aitmed.com/config'

export interface MetadataOptions {
  config: string
}

class Metadata {
  #aggregator: NoodlAggregator
  #replacePlaceholder: (placeholder: string) => string = (s) => s
  #visitors = [] as t.VisitorMapping[]
  #context = {} as Record<string, any>

  constructor(config: MetadataOptions['config']) {
    this.#aggregator = new NoodlAggregator(config)
  }

  get context() {
    return this.#context
  }

  get root() {
    return this.#aggregator.root
  }

  createVisitor(fn: t.VisitorCreation, options?: Record<string, any>) {
    const { context, visit } = fn(this.#aggregator, options)
    u.assign(this.context, context)
    this.#visitors.push(n.createVisitor(visit))
    return this
  }

  async run() {
    try {
      let {
        doc: { root: rootDoc, app: appDoc },
        raw: { root: rootYml, app: appYml },
      } = await this.#aggregator.init({
        loadPages: true,
        loadPreloadPages: true,
      })

      const mappingList = u.reduce(
        this.#visitors,
        (acc, mapping) => {
          for (const [key, fn] of u.entries(mapping)) {
            if (!acc[key]) acc[key] = []
            fn && acc[key].push(fn as any)
          }
          return acc
        },
        {} as Record<keyof t.VisitorMapping, t.VisitFn<any>[]>,
      )

      const getMapping = (label: string, doc: t.ParsedDocument) =>
        u.reduce(
          u.entries(mappingList),
          (acc, [k, v]) => {
            acc[k] = flowRight(
              ...v.map(
                (f): visitorFn<any> =>
                  (key, node, path) =>
                    f({ label, doc, key, node, path }, this.#context),
              ),
            )
            return acc
          },
          {},
        )

      for (const [name, doc] of this.#aggregator.root) {
        visit(doc, getMapping(name, doc as t.ParsedDocument))
      }

      this.#replacePlaceholder = nu.createNoodlPlaceholderReplacer({
        cadlBaseUrl: rootDoc.get('cadlBaseUrl'),
        cadlVersion: rootDoc.getIn(['web', 'cadlVersion', 'test']),
        designSuffix: rootDoc.get('designSuffix'),
      })

      n.purgeRootConfig(rootDoc, this.#replacePlaceholder)
    } catch (error) {
      n.throwError(error)
    }
  }

  parseConfig(type: 'root' | 'app') {}
}

export default Metadata
