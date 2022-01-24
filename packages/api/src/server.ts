import express, { json } from 'express'
import fs from 'fs-extra'
import GraphQLJSON from 'graphql-type-json'
import { ApolloServer } from 'apollo-server-lambda'
import { Query } from './resolvers/graphqlResolvers'

const typeDefs = fs.readFileSync('./src/schema.graphql', 'utf8')

const resolvers = {
  Query,
  JSON: GraphQLJSON,
}

const server = new ApolloServer({
  context({ event, context, express: expressRequest }) {
    return {
      headers: event.headers,
      functionName: context.functionName,
      event,
      context,
      expressRequest,
    }
  },
  debug: true,
  logger: {
    debug: console.debug,
    error: console.error,
    info: console.info,
    warn: console.warn,
  },
  introspection: true,
  plugins: [],
  resolvers,
  typeDefs,
})

exports.handler = server.createHandler({
  expressAppFromMiddleware(middleware) {
    const app = express()
    app.use(
      json({
        limit: 100000000,
      }),
    )
    app.use(middleware)
    return app
  },
})
