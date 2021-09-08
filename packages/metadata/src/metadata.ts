import * as u from '@jsmanifest/utils'
import yaml from 'yaml'
import Aggregator from 'noodl-aggregator'
import { Handler } from '@netlify/functions'
import axios from 'axios'
import fs from 'fs-extra'
import path from 'path'

const hasuraApiEndpoint = 'https://data.pro.hasura.io/v1/graphql'
const graphqlEndpoint = 'https://ecos-noodl.hasura.app/v1/graphql'
const adminSecret =
  'VzqnFhstCXpdPz6bl76kmALogk8n0dDxAm1Y6DFj2k7xcy25Dpu86HzSq5aG6wQo'
const cloudIp = '54.176.149.52'
const project = {
  name: 'ecos-noodl',
  id: '50b3455b-079d-47ce-9048-4826ea6d8d65',
}
const owner = 'pfftdammitchris@gmail.com'

interface Params {
  config?: string
  actionTypes?: boolean
  componentTypes?: boolean
}

export const handler: Handler = async (event, context) => {
  const { queryStringParameters, rawUrl } = event
  const params = queryStringParameters as Params

  const aggregator = new Aggregator()
  const configName = params.config

  if (configName) {
    aggregator.configKey = configName

    const {
      doc: { root: rootDoc, app: appDoc },
      raw: { root: rootYml, app: appYml },
    } = await aggregator.init({
      loadPages: true,
      loadPreloadPages: true,
    })

    const actionObjects = [] as Record<string, any>[]

    for (const [name, doc] of aggregator.root) {
      yaml.visit(doc, {
        Scalar() {},
        Pair(key, node, path) {
          if (
            key === 'key' &&
            yaml.isScalar(node.key) &&
            node.key.value === 'actionType'
          ) {
            actionObjects.push(node.toJSON())
            return yaml.visit.SKIP
          }
        },
        Map() {},
        Seq() {},
        Value() {},
      })
    }
  } else {
    //
  }

  try {
    return {
      statusCode: 200,
      body: '',
    }
  } catch (error) {
    throw error
  }
}
