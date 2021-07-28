// process.stdout.write('\x1Bc')
import * as u from '@jsmanifest/utils'
import * as nc from 'noodl-common'
import flowRight from 'lodash.flowright'
import path from 'path'
import tds from 'transducers-js'
import Aggregator from 'noodl-aggregator'
import { Identify } from 'noodl-types'
import yaml from 'yaml'
import fs from 'fs-extra'
import pkg from '../package.json'

const paths = {
	docs: nc.getAbsFilePath('generated/test'),
	metadata: nc.getAbsFilePath('data/generated/metadata.json'),
	typings: nc.getAbsFilePath('data/generated/typings.d.ts'),
	stats: nc.getAbsFilePath('data/generated/data.json'),
}

for (const [key, filepath] of u.entries(paths)) {
	paths[key] = nc.normalizePath(filepath)
}

// const aggregator = new Aggregator('meet4d')
// const docFiles = nc.loadFilesAsDocs({
// 	as: 'metadataDocs',
// 	dir: paths.docs,
// 	includeExt: false,
// 	recursive: true,
// })

// const { name, doc } = docFiles[0]

// const titlePair = doc.contents.items[0].value.items[2] as yaml.Pair
// const viewComponentMap = doc.contents.items[0].value.items[3].value
// 	.items[0] as yaml.YAMLMap

// const alias = doc.createAlias(titlePair)

// doc.add(alias)

// console.log(doc.toString())

export interface VisitFn<N extends yaml.Node = yaml.Node> {
	(
		args: {
			key: Parameters<yaml.visitorFn<N>>[0]
			node: Parameters<yaml.visitorFn<N>>[1]
			path: Parameters<yaml.visitorFn<N>>[2]
		} & Record<string, any>,
	): ReturnType<yaml.visitorFn<N>>
}

export type VisitTransducerFn<N extends yaml.Node = yaml.Node> = (
	fn: VisitFn<N>,
) => (
	step: (
		acc: VisitFn<N>,
		args: Parameters<VisitFn<N>>[0],
	) => (args: Parameters<VisitFn<N>>[0]) => VisitFn<N>,
) => any

class Visitor {
	agg: Aggregator

	constructor() {
		this.agg = new Aggregator('meet4d')
	}

	async init() {
		try {
			const { doc, raw: yml } = await this.agg.init({
				loadPages: false,
				loadPreloadPages: false,
			})
			const preloadPages = await this.agg.loadPreloadPages()
			// const pages = await this.agg.loadPages()
		} catch (error) {
			console.error(error)
		}
	}
}

function createVisitorFactory() {
	function _createVisitor(fn) {
		return function (args: { key; node; path }) {
			return fn(args)
		}
	}

	function _compose(...fns: VisitFn[]): VisitFn {
		const step = function (acc: VisitFn, args: Parameters<VisitFn>[0]) {
			return acc(args)
		}
		return flowRight(...fns)(step)
	}

	const _visit: VisitFn = function (args) {}

	const o = {
		compose: _compose,
		createVisitor: _createVisitor,
		visit: _visit,
	}

	return o
}

const visitorFactory = createVisitorFactory()

const doc = nc.loadFileAsDoc(
	path.join(__dirname, '../generated/meet4d/SignIn.yml'),
)

// ;(async () => {
// 	try {
// 		const visitor = new Visitor()
// 		await visitor.init()
// 		yaml.visit(doc, (key, node, path) => composedVisitors({ key, node, path }))
// 	} catch (error) {
// 		throw error
// 	}
// })()

const evalObject = {
	actionType: 'evalObject',
	object: '..name',
}
