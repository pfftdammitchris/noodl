import y from 'yaml'
import flatten from 'lodash/flatten'
import * as nt from 'noodl-types'
import * as u from '@jsmanifest/utils'
import type { YAMLNode } from 'noodl'
import * as t from './types'
import Store from './Store'
import { Validator, KeyValidator, ValueValidator } from './validatorFactory'

export interface VisitFnParamsObject<N = unknown> {
  key: Parameters<y.visitorFn<N>>[0]
  node: Parameters<y.visitorFn<N>>[1]
  path: Parameters<y.visitorFn<N>>[2]
}

export interface VisitorFn<
  N = unknown,
  Opts extends Record<string, any> = Record<string, any>,
> {
  (args: VisitFnParamsObject<N> & { store: Store } & Opts):
    | ReturnType<y.visitorFn<N>>
    | ReturnType<y.asyncVisitorFn<N>>
}

export interface Plugin {
  key: string
  init?: (store: Store) => void
  any?: VisitorFn<
    unknown,
    {
      type:
        | 'Alias'
        | 'Collection'
        | 'Document'
        | 'Map'
        | 'Seq'
        | 'Pair'
        | 'Scalar'
    }
  >[]
  Alias?: VisitorFn<y.Alias>[]
  Collection?: VisitorFn<y.YAMLMap | y.YAMLSeq>[]
  Map?: VisitorFn<y.YAMLMap>[]
  Node?: VisitorFn<y.Alias | y.Scalar | y.YAMLMap | y.YAMLSeq>[]
  Pair?: VisitorFn<y.Pair>[]
  Scalar?: VisitorFn<y.Scalar>[]
  Seq?: VisitorFn<y.YAMLSeq>[]
}

export interface ExtractOptions {
  config: string
  /** @default 'web' */
  deviceType?: nt.DeviceType
  /** @default 'test' */
  env?: nt.Env
  /** @default 'error' */
  loglevel?: t.LogLevel
  /** @default 'latest' */
  plugins?: Plugin[]
  version?: string
}

function createValidate() {
  let validators = [] as Validator[]

  async function validate(node: YAMLNode) {
    try {
      let nodes = [] as (y.Node | y.Document | y.Document.Parsed)[]
      let errors = []
      let warnings = []
      let infos = []

      if (y.isNode(node) || y.isDocument(node)) {
        nodes.push(node)
      } else if (
        (y.isPair(node) && y.isNode(node.value)) ||
        y.isDocument(node.value)
      ) {
        nodes.push(node.value)
      }

      await Promise.all(
        nodes.map(async (_node) => {
          await y.visitAsync(_node, async function onVisit(key, node, path) {
            await Promise.all(
              validators.map(async (validator) => {
                try {
                  const result = validator.validate({
                    key,
                    value: _node,
                    path,
                  })

                  if (!u.isUnd(result)) results.push(result)
                } catch (error) {
                  results.push(
                    error instanceof Error ? error : new Error(String(error)),
                  )
                }
              }),
            )

            return results
          })
        }),
      )

      return results
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error))
      throw err
    }
  }

  return validate
}

export default createValidate
