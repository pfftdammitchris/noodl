import { GatsbyFunctionRequest, GatsbyFunctionResponse } from 'gatsby'
import u from '@jsmanifest/utils'
import * as nt from 'noodl-types'
import Metadata from '../Metadata'
import { getSuccessResponse, getErrorResponse } from '../utils'
import actionsVisitor, {
  ActionsVisitorContext,
} from '../Metadata/visitors/actionsVisitor.js'
import componentsVisitor, {
  ComponentsVisitorContext,
} from '../Metadata/visitors/componentsVisitor.js'

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
  actionObjects?: boolean
  actionsStats?: boolean
  componentTypes?: string[]
  componentObjects?: nt.ComponentObject[]
  componentsStats?: Record<string, number>
}

export default async function metadataFunction(
  req: GatsbyFunctionRequest,
  resp: GatsbyFunctionResponse,
) {
  try {
    const { body, method, params, query } = req

    console.log({ params })

    const configName = params?.config || ''

    if (!configName) throw new Error(`Variable "config" is required`)

    const metadata = new Metadata(configName)

    if (
      [params.actionTypes, params.actionObjects, params.actionsStats].some(
        (cond) => !!cond,
      )
    ) {
      const options = {} as Record<keyof ActionsVisitorContext, boolean>

      params.actionTypes && (options.actionTypes = true)
      params.actionObjects && (options.actionObjects = true)
      params.actionsStats && (options.actionsStats = true)

      metadata.createVisitor(actionsVisitor, options)
    }

    if (
      [
        params.componentTypes,
        params.componentObjects,
        params.componentsStats,
      ].some((cond) => !!cond)
    ) {
      const options = {} as Record<keyof ComponentsVisitorContext, boolean>

      params.componentTypes && (options.componentTypes = true)
      params.componentObjects && (options.componentObjects = true)
      params.componentsStats && (options.componentsStats = true)

      metadata.createVisitor(componentsVisitor, options)
    }

    await metadata.run()

    resp.json(getSuccessResponse(metadata.context))
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error))
    return resp.json({
      statusCode: 500,
      error: { name: err.name, message: err.message },
    })
  }
}
