import * as u from '@jsmanifest/utils'
import * as nt from 'noodl-types'
import curry from 'lodash/curry'
import flowRight from 'lodash/flowRight'
import y from 'yaml'
import { ExpressContext, gql } from 'apollo-server-express'
import { GraphQLFieldResolver } from 'graphql'
import { LambdaContextFunctionParams } from 'apollo-server-lambda/dist/ApolloServer'
import { scalarFns, pairFns, mapFns, seqFns } from '../metadataFns'
import * as t from '../types/apiTypes'

type FunctionContext = Omit<LambdaContextFunctionParams, 'express'> & {
  expressRequest: ExpressContext
  functionName: string
  headers: Record<string, any>
}

const endpoint = 'https://ecos-noodl.hasura.app/v1/graphql'

function wrapVisitorFn<N = unknown>(
  fn: t.PreWrappedApiVisitor<N>,
): y.visitorFn<N> {
  return (key, node, path) => fn({ key, node, path })
}

export const Query: Record<
  string,
  GraphQLFieldResolver<any, FunctionContext>
> = {
  async metadata(_, args, { event, headers }): Promise<any> {
    try {
      let { body, queryStringParameters: params } = event

      body = u.isStr(body) ? JSON.parse(body) : body
      let variables = body?.variables || {}
      // console.log({ body, args, variables })

      const method = event.requestContext?.httpMethod
      const requestId = event.requestContext?.requestId
      const requestTime = event.requestContext?.requestTimeEpoch
      const contentLength = Number(headers['Content-Length'])
      const userAgent = headers['User-Agent']

      const store = {} as Record<string, any>
      const composeMetadataFns = (mapping) =>
        u
          .values(mapping)
          .reduceRight(
            (acc, fn) => acc.concat(u.isFnc(fn) ? fn(store) : (s: any) => s),
            [],
          )

      const composedScalarFns = flowRight(...composeMetadataFns(scalarFns))
      const composedPairFns = flowRight(...composeMetadataFns(pairFns))
      const composedMapFns = flowRight(...composeMetadataFns(mapFns))
      const composedSeqFns = flowRight(...composeMetadataFns(seqFns))

      const mergeArgs = (
        fn: (
          args: Parameters<t.PreWrappedApiVisitor>[0] & { page: string },
        ) => void,
      ) => {
        return curry(
          (name: string, args: Parameters<t.PreWrappedApiVisitor>[0]) =>
            fn({ page: name, ...args }),
        )
      }

      const composeMergedMappers = (mapping) => {
        return u.entries(mapping).reduce((acc, [nodeType, fn]) => {
          acc[nodeType] = (...args: Parameters<y.visitorFn<any>>) => fn(...args)
          return acc
        }, {})
      }

      if (body?.data?.pages) {
        for (const [name, yml] of u.entries(body.data.pages)) {
          const doc = y.parseDocument(yml)

          if (y.isMap(doc.contents) && doc.has(name)) {
            doc.contents = doc.get(name) as any
          }

          y.visit(
            doc,
            composeMergedMappers({
              Scalar: wrapVisitorFn(mergeArgs(composedScalarFns)),
              Pair: wrapVisitorFn(mergeArgs(composedPairFns)),
              Map: wrapVisitorFn(mergeArgs(composedMapFns)),
              Seq: wrapVisitorFn(mergeArgs(composedSeqFns)),
            }),
          )
        }
      }

      return store
    } catch (error) {
      if (error instanceof Error) throw error
      throw new Error(String(error))
    }
  },
}

export const Mutation = {
  //
}
