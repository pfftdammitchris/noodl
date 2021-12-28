const dotenv = require('dotenv')
dotenv.config({ path: 'packages/api/.env' })
dotenv.config({ path: '../env' })
const { gql } = require('apollo-server-lambda')
const globby = require('globby')
const fs = require('fs-extra')
const path = require('path')
const u = require('@jsmanifest/utils')
const n = require('noodl')
const nt = require('noodl-types')
const axios = require('axios').default

const graphqlEndpoint = `http://127.0.0.1:3000/dev/graphql`
const headers = {
  Authorization: `pat ${process.env.HASURA_GRAPHQL_ADMIN_SECRET}`,
  'x-hasura-admin-secret': process.env.HASURA_GRAPHQL_ADMIN_SECRET,
}

const SignInYml = fs.readFileSync(
  n.getAbsFilePath('generated/meetd2/SignIn.yml'),
  'utf8',
)

async function start() {
  try {
    // const ymlFilePaths = await globby(
    //   n.getAbsFilePath('generated/meetd2/*.yml'),
    //   {},
    // )
    // const ymlPages = ymlFilePaths.slice(0, 11).reduce((acc, filepath) => {
    //   const filename = path.parse(filepath).name
    //   acc[filename] = fs.readFileSync(filepath, 'utf8')
    //   return acc
    // }, {})

    const ymlPages = { SignIn: SignInYml }

    const { data } = await axios.post(
      graphqlEndpoint,
      {
        data: {
          pages: ymlPages,
        },
        query: `{
          actionTypes {
            actionType
            occurrences
            properties {
              isReference
              location {
                start
                end
              }
              trigger
              value
            }
          }
        }`,
        variables: {
          trigger: 'if',
        },
      },
      { headers: { 'Content-Type': 'application/json' } },
    )

    console.dir(data, { depth: Infinity })
  } catch (error) {
    const apolloErrors = error.response?.data?.errors || []
    console.dir(
      {
        statusCode: error.response?.status,
        statusText: error.response?.statusText,
        name: error.name,
        message: error.message,
        apolloErrors,
      },
      { depth: Infinity },
    )
    // if (error instanceof Error) throw error
    // throw new Error(String(error))
  }
}

start()
