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
import * as t from './types'

const paths = {
	docs: nc.getAbsFilePath('generated/test'),
	metadata: nc.getAbsFilePath('data/generated/metadata.json'),
	typings: nc.getAbsFilePath('data/generated/typings.d.ts'),
	stats: nc.getAbsFilePath('data/generated/data.json'),
}

for (const [key, filepath] of u.entries(paths)) {
	paths[key] = nc.normalizePath(filepath)
}

export interface VisitFn<N = unknown> {
	(args: {
		context: {
			name: string
			visitee: yaml.Node | yaml.Document
		}
		key: Parameters<yaml.visitorFn<N>>[0]
		node: Parameters<yaml.visitorFn<N>>[1]
		path: Parameters<yaml.visitorFn<N>>[2]
	}): ReturnType<yaml.visitorFn<N>>
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
	const visitors = [] as VisitFn[]

	function _createVisitor(fn: VisitFn) {
		return function (args: Parameters<VisitFn>[0]) {
			return (step) => step(fn, fn(args))
		}
	}

	function _compose(...fns: VisitFn[]): VisitFn {
		return flowRight(...fns)
	}

	const _visit = function (doc: yaml.Node | yaml.Document, fn: VisitFn) {
		yaml.visit(doc, (key, node, path) =>
			fn({
				context: doc,
				key,
				node,
				path,
			}),
		)
	}

	const o = {
		compose: _compose,
		createVisitor: _createVisitor,
		visit: _visit,
	}

	return o
}

const visitorFactory = createVisitorFactory()

const actionsVisitor = function ({
	context: { name, visitee },
	key,
	node,
	path,
}: Parameters<VisitFn>[0]) {
	if (yaml.isScalar(node)) {
		if (Identify.reference(node.value) && u.isStr(node.value)) {
			const reference = node.value
			let dataObject
			let locations: t.LocationObject
			let pages: string[]

			if (!(reference in actionsVisitor.data)) {
				dataObject = actionsVisitor.data[reference] = {
					pages: [],
					occurred: 0,
					locations: {},
				}
				locations = dataObject.locations
				pages = dataObject.pages
			}

			if (pages && name) {
				!pages.includes(name) && pages.push(name)
			}

			if (dataObject) {
				dataObject.occurred++
			}

			if (locations) {
				!locations.pages && (locations.pages = [])

				if (!locations.pages.includes(name)) {
					locations.pages.push(name)
				}
			}
		}
	}
}

actionsVisitor.data = {} as Record<string, t.DataObject>

const doc = nc.loadFileAsDoc(
	path.join(__dirname, '../generated/meet4d/SignIn.yml'),
)

const visitor = new Visitor()
const composedVisitors =
	(context: { name: string; visitee: yaml.Node | yaml.Document }): VisitFn =>
	(args2) =>
		visitorFactory.compose(actionsVisitor)({ ...args2, context })

visitor
	.init()
	.then(() => {
		for (const [name, visitee] of visitor.agg.root) {
			visitorFactory.visit(doc, composedVisitors({ name, visitee }))
		}
		return fs.writeJson(paths.metadata, actionsVisitor.data, { spaces: 2 })
	})
	.catch(console.error)

const evalObject = {
	actionType: 'evalObject',
	object: '..name',
}
