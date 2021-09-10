import dotenv from 'dotenv'
dotenv.config()
import * as u from '@jsmanifest/utils'
import * as nu from 'noodl-utils'
import * as nt from 'noodl-types'
import NoodlAggregator from 'noodl-aggregator'
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
} from 'yaml'
import fs from 'fs-extra'
import path from 'path'
import axios from 'axios'
import chalk from 'chalk'
import * as n from './utils.js'

const baseConfigUrl = 'https://public.aitmed.com/config'

function throwError(err: Error | string) {
  if (err instanceof Error) throw err
  throw new Error(err)
}

export interface MetadataOptions {
  config: string
}

class Metadata {
  #aggregator: NoodlAggregator
  #replacePlaceholder: (placeholder: string) => string

  options: MetadataOptions

  constructor(config: MetadataOptions['config']) {
    this.#aggregator = new NoodlAggregator(config)
  }

  get root() {
    return this.#aggregator.root
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

      this.#replacePlaceholder = nu.createNoodlPlaceholderReplacer({
        cadlBaseUrl: rootDoc.get('cadlBaseUrl'),
        cadlVersion: rootDoc.getIn(['web', 'cadlVersion', 'test']),
        designSuffix: rootDoc.get('designSuffix'),
      })

      n.purgeRootConfig(rootDoc, this.#replacePlaceholder)
    } catch (error) {
      throwError(error)
    }
  }

  parseConfig(type: 'root' | 'app') {}
}

const metadata = new Metadata('admind2')

metadata
  .run()
  .then(() => {
    console.log([...metadata.root.keys()])
  })
  .catch(throwError)

export default Metadata
