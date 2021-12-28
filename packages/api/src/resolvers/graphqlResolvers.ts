import * as u from '@jsmanifest/utils'
import * as nt from 'noodl-types'
import y from 'yaml'
import { ExpressContext, gql } from 'apollo-server-express'
import { GraphQLFieldResolver } from 'graphql'
import { LambdaContextFunctionParams } from 'apollo-server-lambda/dist/ApolloServer'
import axios from 'axios'
import * as t from '../types/graphqlTypes'

const is = nt.Identify

type FunctionContext = Omit<LambdaContextFunctionParams, 'express'> & {
  expressRequest: ExpressContext
  functionName: string
  headers: Record<string, any>
}

const endpoint = 'https://ecos-noodl.hasura.app/v1/graphql'

export const Query: Record<
  string,
  GraphQLFieldResolver<any, FunctionContext>
> = {
  async actionTypes(
    _,
    args,
    { event, headers },
  ): Promise<t.ActionTypesQueryItem[]> {
    try {
      let { body, queryStringParameters: params } = event
      body = u.isStr(body) ? JSON.parse(body) : body

      console.log({ body, args })

      const method = event.requestContext?.httpMethod
      const requestId = event.requestContext?.requestId
      const requestTime = event.requestContext?.requestTimeEpoch
      const contentLength = Number(headers['Content-Length'])
      const userAgent = headers['User-Agent']
      const docs = [] as y.Document[]

      const results = {} as {
        [actionType: string]: {
          occurrences: number
          properties?: {
            [property: string]: t.PropertyMetadata[]
          }
        }
      }

      function getOrCreatePropertyMeta(
        property: unknown | string | number | y.Scalar,
      ) {
        let key: string | number = ''
        if (!property) return null
        if (y.isScalar(property)) key = property.value as any
        if (u.isStr(property) || u.isNum(property)) key = property
        if (!results[key]) {
          results[key] = {
            occurrences: 0,
          }
        }
        return results[key]
      }

      function getTrigger(
        path: (y.Node | y.Document<unknown> | y.Pair<unknown, unknown>)[],
      ) {
        const node = path[path.length - 1]
        if (y.isPair(node)) return node.key
        if (node) {
          path = [...path]
          path.pop()
          return getTrigger(path)
        }
        return null
      }

      if (body?.data?.pages) {
        for (const [name, yml] of u.entries(body?.data?.pages)) {
          const doc = y.parseDocument(yml)

          if (y.isMap(doc.contents) && doc.has(name)) {
            doc.contents = doc.get(name) as any
          }

          y.visit(doc, {
            Pair: (_, node) => {
              if (y.isScalar(node.key) && node.key.value === 'actionType') {
                const actionType = String(node.value)
                const metaObj = getOrCreatePropertyMeta(actionType)
                metaObj.occurrences++
              }
            },
            Map: (_, node, path) => {
              if (node.has('actionType')) {
                const actionType = String(node.get('actionType'))
                const metaObj = getOrCreatePropertyMeta(actionType)

                for (const item of node.items) {
                  let { key, value } = item

                  if (y.isScalar(key)) {
                    if (u.isStr(key.value) && key.value !== 'actionType') {
                      const isReference = is.reference(key.value)
                      const propertyObj = {
                        key,
                        value,
                        isReference,
                        trigger: getTrigger(path),
                        location: {
                          start: node.range[0],
                          end: node.range[1],
                        },
                      } as t.PropertyMetadata

                      if (!metaObj.properties) metaObj.properties = {}
                      if (!metaObj.properties[key.value]) {
                        metaObj.properties[key.value] = []
                      }

                      metaObj.properties[key.value].push(propertyObj)
                    }
                  }
                }
              }
            },
          })
        }
      }

      function formatPropertyMeta(
        property: string,
        propertyMeta: t.PropertyMetadata,
      ) {
        return { value: property, ...propertyMeta }
      }

      function formatMetaObject(
        actionType = '',
        metaObj: Pick<t.ActionTypesQueryItem, 'occurrences'> & {
          properties?: Record<string, t.PropertyMetadata[]>
        },
      ) {
        console.log({ actionType, metaObj })
        return {
          actionType,
          ...metaObj,
          properties: u.reduce(
            u.entries(metaObj.properties),
            (acc, [property, propertyMeta]) => {
              console.log({ property, propertyMeta })

              return acc.concat(
                propertyMeta.map((meta) => formatPropertyMeta(property, meta)),
              )
            },
            [],
          ),
        }
      }

      const result = u.reduce(
        u.entries(results),
        (acc, [actionType, metaObj]) =>
          acc.concat(formatMetaObject(actionType, metaObj)),
        [],
      )

      return result
    } catch (error) {
      if (error instanceof Error) throw error
      throw new Error(String(error))
    }
  },
}

export const Mutation = {
  //
}
