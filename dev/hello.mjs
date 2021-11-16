import * as u from '@jsmanifest/utils'
import { loadFile, loadFiles, Visitor } from 'noodl'
import flowRight from 'lodash/flowRight.js'
import globby from 'globby'
import * as nt from 'noodl-types'
import * as nu from 'noodl-utils'
import fs from 'fs-extra'
import path from 'path'
import axios from 'axios'
import { Loader } from 'noodl'
import yaml from 'yaml'

const {
  isNode,
  isScalar,
  isPair,
  isMap,
  isSeq,
  isDocument,
  Scalar,
  Pair,
  YAMLMap,
  YAMLSeq,
  Document: YAMLDocument,
  visit: YAMLVisit,
  visitorFn: YAMLVisitorFn,
} = yaml

const aggregator = new Loader({
  config: 'meetd2',
  deviceType: 'web',
  dataType: 'object',
  env: 'test',
  version: 'latest',
  loglevel: 'info',
})

await aggregator.init({
  dir: 'generated/meetd2',
  spread: ['BaseDataModel', 'BaseCSS', 'BasePage'],
})

const visitor = new Visitor()
visitor.root = aggregator.root

const visitorFns = flowRight(referenceVisitor, ({ key, node, path, meta }) => {
  return node
})

// for (const [name, node] of u.entries(visitor.root)) {
// 	visitor.visit(visitorFns, node)
// }

;(async () => {
  try {
    // const ymlDocsString = u.reduce(
    // 	await globby(
    // 		path.resolve(path.join(process.cwd(), 'generated/meetd2/**/*.yml')),
    // 	),
    // 	(acc, filepath) => {
    // 		try {
    // 			let yml = fs.readFile(filepath, 'utf8')
    // 			return acc + yml + `\n...\n`
    // 		} catch (error) {
    // 			console.error(`[${u.yellow(error.name)}] ${u.red(error.message)}`)
    // 		}
    // 		return acc
    // 	},
    // 	'',
    // )
    // const docsStream = yaml.parseAllDocuments(ymlDocsString, {
    // 	logLevel: 'debug',
    // })
    // console.log(docsStream)
  } catch (error) {
    console.error(`[${u.yellow(error.name)}] ${u.red(error.message)}`)
  }
})()

function referenceVisitor({ key, node, path, root }) {
  if (isScalar(node)) {
    if (is.reference(node.value)) {
      //
    }
  }
  return node
}
