process.stdout.write('\x1Bc')
import dotenv from 'dotenv'
dotenv.config({ path: '../../.env' })
dotenv.config({ path: './.env' })
import * as u from '@jsmanifest/utils'
import * as nt from 'noodl-types'
import fs from 'fs-extra'
import path from 'path'
import { request, gql } from 'graphql-request'
import { graphqlEndpoint } from './config'

console.log({
  HASURA_ADMIN_SECRET: process.env.HASURA_GRAPHQL_ADMIN_SECRET,
})

export async function queryActions() {
  try {
    const resp = await request(
      graphqlEndpoint,
      gql`
        query {
          actions {
            created_at
            properties
            updated_at
          }
        }
      `,
      undefined,
      { 'x-hasura-admin-secret': process.env.HASURA_GRAPHQL_ADMIN_SECRET },
    )
    return resp
  } catch (error) {
    if (error instanceof Error) throw error
    throw new Error(String(error))
  }
}

queryActions()
  .then((resp) => {
    console.log(resp)
  })
  .catch(console.error)
