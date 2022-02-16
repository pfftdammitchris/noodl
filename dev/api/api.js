const dotenv = require('dotenv')
dotenv.config({ path: 'packages/api/.env' })
dotenv.config({ path: '../env' })
const chunk = require('lodash/chunk')
const merge = require('lodash/merge')
const uniq = require('lodash/uniq')
const chalk = require('chalk')
const { gql } = require('apollo-server-lambda')
const fg = require('fast-glob')
const fs = require('fs-extra')
const path = require('path')
const u = require('@jsmanifest/utils')
const n = require('noodl')
const nt = require('noodl-types')
const axios = require('axios').default
const y = require('yaml')
const traverse = require('./traverse')

const graphqlEndpoint = `http://127.0.0.1:3000/dev/graphql`
const headers = {
  Authorization: `pat ${process.env.HASURA_GRAPHQL_ADMIN_SECRET}`,
  'x-hasura-admin-secret': process.env.HASURA_GRAPHQL_ADMIN_SECRET,
}

const SignInYml = fs.readFileSync(
  n.getAbsFilePath('generated/admind3/SignIn.yml'),
  'utf8',
)

async function start() {
  try {
    const fileData = { actionTypes: [], componentTypes: [] }
    const ymlPages = {}

    for (const entry of await fg(
      `${n.getAbsFilePath('generated/admind3')}/**/*.yml`,
      { deep: true, onlyFiles: true, objectMode: true },
    )) {
      ymlPages[entry.name.substring(0, entry.name.lastIndexOf('.'))] =
        await fs.readFile(entry.path, 'utf8')
    }

    const promises = u
      .entries(ymlPages)
      .slice(0, 11)
      .map(async ([pageName, pageYml]) => {
        const { data } = await axios.post(graphqlEndpoint, {
          data: { pages: { [pageName]: pageYml } },
          query: `{ metadata }`,
        })

        const metadata = data?.data?.metadata || {}

        metadata.actionTypes?.forEach?.((actionType) => {
          if (!fileData.actionTypes.includes(actionType)) {
            fileData.actionTypes.push(actionType)
          }
        })

        metadata.componentTypes?.forEach?.((type) => {
          if (!fileData.componentTypes.includes(type)) {
            fileData.componentTypes.push(type)
          }
        })

        // for (const [actionType, { properties }] of u.entries(data.actions)) {
        //   if (!fileData[actionType]) {
        //     fileData[actionType] = {}
        //   }

        //   if (!fileData[actionType].pageNames) {
        //     fileData[actionType].pageNames = []
        //   }

        //   if (!fileData[actionType].pageNames.includes(pageName)) {
        //     fileData[actionType].pageNames.push(pageName)
        //   }

        //   if (!fileData[actionType]) {
        //     fileData[actionType] = {}
        //   }

        //   if (!fileData[actionType].occurrences) {
        //     fileData[actionType].occurrences = 0
        //   }

        //   if (!fileData[actionType].properties) {
        //     fileData[actionType].properties = {}
        //   }

        //   if (!fileData[actionType].keyOccurrences) {
        //     fileData[actionType].keyOccurrences = {}
        //   }

        //   fileData[actionType].occurrences++

        //   for (const propObject of properties) {
        //     const { key, isReference } = propObject

        //     if (!fileData[actionType].properties[key]) {
        //       fileData[actionType].properties[key] = []
        //     }

        //     if (!fileData[actionType].keyOccurrences[key]) {
        //       fileData[actionType].keyOccurrences[key] = 0
        //     }

        //     if (!fileData[actionType].totalReferences) {
        //       fileData[actionType].totalReferences = 0
        //     }

        //     if (isReference) {
        //       fileData[actionType].totalReferences++
        //     }

        //     fileData[actionType].keyOccurrences[key]++

        //     fileData[actionType].properties[key].push(propObject)
        //   }
        // }
      })

    const chunks = chunk(promises, 10)
    const chunk1 = chunks.slice(0, 5)
    const chunk2 = chunks.slice(6, 11)
    const chunk3 = chunks.slice(12, 18)
    const chunk4 = chunks.slice(19, 25)
    const chunk5 = chunks.slice(26, 30)

    const promise1 = chunk1.map((chk) => Promise.all(chk.map((c) => c)))
    const promise2 = chunk2.map((chk) => Promise.all(chk.map((c) => c)))
    const promise3 = chunk3.map((chk) => Promise.all(chk.map((c) => c)))
    const promise4 = chunk4.map((chk) => Promise.all(chk.map((c) => c)))
    const promise5 = chunk5.map((chk) => Promise.all(chk.map((c) => c)))

    await Promise.all(promise1, promise2, promise3, promise4, promise5)

    fileData.actionTypes.sort()
    fileData.componentTypes.sort()
    console.log(fileData)
    await fs.writeJson('./actionTypes.json', fileData, { spaces: 2 })
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
  }
}

function start2() {
  const hotpink = chalk.keyword('hotpink')
  const items = []
  const openedBracket = hotpink('[')
  const closedBracket = hotpink(']')
  const kindLabel = u.cyan(kind)
  const tag = u.yellow(tag)
  traverse((args) => {
    const isIndex = !args.key
    items.push({
      ...(isIndex ? { index: args.index } : { key: args.key }),
      value: args.value,
      path: args.path,
    })
    const kind = args.key ? 'key' : 'index'
    const tag = args[kind]
    console.log(
      `${openedBracket}${kindLabel}${closedBracket}-${openedBracket}${tag}${closedBracket}`,
      args,
    )
    u.newline()
  }, y.parseDocument(SignInYml))

  fs.writeJsonSync('./r.json', items, { spaces: 1 })
}

/**
 * @param  { ...((...args: any[]) => any) } fns
 */
function compose(...fns) {
  return fns.reduceRight(function (acc, fn) {
    return acc
  }, [])
}

/**
 * @param { (...args: any[]) => any } fn
 */
function wrap(fn) {
  //
}

start()
