const curry = require('lodash/curry')
const flowRight = require('lodash/flowRight')
const u = require('@jsmanifest/utils')
const yaml = require('yaml')
const axios = require('axios').default
const fs = require('fs-extra')
const path = require('path')
const { default: Aggregator } = require('noodl-aggregator')
const { Metadata } = require('./dist')

const { isDocument, isScalar, isPair, isMap, isSeq } = yaml

function logError(error) {
  if (!(error instanceof Error)) error = new Error(error)
  return console.error(
    `[${u.yellow(error.name)}] ${u.red(error.message)}`,
    '\n' + error.stack.split('\n').slice(1).join('\n'),
  )
}

/**
 * @param { Aggregator } aggregator
 * @return { ReturnType<import('./dist').VisitorCreation> }
 */
const actionsVisitor = function (aggregator) {
  return {
    context: {
      actionTypes: [],
      actionObjects: [],
      actionsStats: { builtIn: { total: 0 } },
    },
    visit: {
      Pair: ({ node }, { actionTypes }) => {
        if (
          isScalar(node.key) &&
          node.key.value === 'actionType' &&
          isScalar(node.value) &&
          u.isStr(node.value.value)
        ) {
          const actionType = node.value.value
          if (!actionTypes.includes(actionType)) {
            actionTypes.push(actionType)
          }
        }
      },
      Map: ({ node }, { actionObjects, actionsStats }) => {
        if (node.has('actionType')) {
          // actionObjects.push(node.toJSON())
          const actionType = node.get('actionType')
          if (!u.isNum(actionsStats[actionType])) {
            actionsStats[actionType] = 0
          }
          if (actionType === 'builtIn') {
            const funcName = node.get('funcName')
            if (!u.isNum(actionsStats.builtIn[funcName])) {
              actionsStats.builtIn[funcName] = 0
            }
            actionsStats.builtIn[funcName]++
            actionsStats.builtIn.total++
          } else {
            actionsStats[actionType]++
          }
        }
      },
    },
  }
}

const visitorFns = [actionsVisitor]

async function start() {
  try {
    const metadata = new Metadata('admind2')

    visitorFns.map((f) => metadata.createVisitor(f))

    await metadata.run()
    console.log(metadata.context)
  } catch (error) {
    console.error(error)
  }
}

start()

//
// ;(async () => {
//   try {
//     const resp = await axios.get(
//       `http://127.0.0.1:3000/.netlify/functions/metadata`,
//       {
//         params: {
//           config: 'admind2',
//           actionTypes: true,
//         },
//       },
//     )
//     console.log(resp.data)
//   } catch (error) {
//     logError(error)
//   }
// })()
