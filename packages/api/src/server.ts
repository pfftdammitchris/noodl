import express from 'express'
import fs from 'fs-extra'
import { ApolloServer, gql } from 'apollo-server-lambda'
import { Query, Mutation } from './resolvers/graphqlResolvers'

const typeDefs = fs.readFileSync('./src/schema.graphql', 'utf8')

const resolvers = {
  Query,
  // Mutation,
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
    app.use(middleware)
    return app
  },
})
