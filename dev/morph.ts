// process.stdout.write('\x1Bc')
import * as u from '@jsmanifest/utils'
import * as nc from 'noodl-common'
import flowRight from 'lodash.flowright'
import path from 'path'
import tds from 'transducers-js'
import Aggregator from 'noodl-aggregator'
import { Identify } from 'noodl-types'
import {
	isDocument,
	isMap,
	isNode,
	isPair,
	isScalar,
	isSeq,
	YAMLMap,
	YAMLSeq,
	Pair,
	Scalar,
	Node as YAMLNode,
	Document as YAMLDocument,
	visit as YAMLVisit,
	visitorFn as YAMLVisitorFn,
} from 'yaml'
import fs from 'fs-extra'
import pkg from '../package.json'
import * as t from './types'

const flat = <V = any>(...v: V[]) =>
	u.reduce(
		v,
		(acc, _) => {
			if (u.isArr(_)) acc.push(..._)
			else acc.push(_)
			return acc
		},
		[] as V[],
	)

const CONFIG = 'meetd2'
const paths = {
	docs: nc.getAbsFilePath('generated/test'),
	metadata: nc.getAbsFilePath('data/generated/metadata.json'),
	typings: nc.getAbsFilePath('data/generated/typings.d.ts'),
	stats: nc.getAbsFilePath('data/generated/data.json'),
}

for (const [key, filepath] of u.entries(paths)) {
	paths[key] = nc.normalizePath(filepath)
}

class Visitor {
	#visit: t.VisitFn

	constructor(visit: t.VisitFn) {
		this.#visit = visit
	}

	get visit() {
		return this.#visit
	}
}

function getVisitorHelpers(aggregator: Aggregator) {
	function _get(this: YAMLNode | YAMLDocument, key = '') {
		Identify.reference(key) && (key = Identify.reference.format(key))
		const [firstKey = '', ...rest] = key.split('.')
		if (firstKey) {
			const isLocal = firstKey[0].toLowerCase() === firstKey[0]
			if (isLocal) {
				if (isMap(this) || isDocument(this)) {
					return this.getIn(key.split('.'))
				}
			} else {
				const rootDoc = aggregator.root[firstKey]
				if (isMap(rootDoc) || isDocument(rootDoc)) {
					return rootDoc.getIn(rest)
				}
			}
		} else {
			//
		}
	}

	const o = {
		compose: (...fns: t.VisitFn[]): t.VisitFn => flowRight(...fns),
		get: _get,
	}
	return o
}

function createVisitorFactory(
	config = 'aitmed',
	aggregator = new Aggregator(config),
) {
	const visitors = [] as Visitor[]
	const utils = getVisitorHelpers(aggregator)

	function _createVisitor(fn: t.VisitFn) {
		return function (args: Parameters<t.VisitFn>[0]) {
			return (step) => step(fn, fn(args))
		}
	}

	const _visit = function (
		context: {
			visitee: YAMLNode | YAMLDocument
			name: string
			root: Aggregator['root']
		},
		visitVisitee: t.VisitFn,
	) {
		YAMLVisit(doc, (key, node, path) =>
			visitVisitee.call(doc, {
				context,
				key,
				node,
				path,
			}),
		)
	}

	const o = {
		compose: (...fns: t.VisitFn[]): t.VisitFn => flowRight(...fns),
		createVisitor: _createVisitor,
		visit: _visit,
		use: (fn: t.VisitFn) => visitors.push(new Visitor(fn)),
	}

	return o
}

function getParentInfo<N extends YAMLNode>(node: N | null | undefined) {
	if (node) {
		if (isSeq(node)) {
			//
		} else if (isMap(node)) {
			//
		} else if (isPair(node)) {
			//
		}
	}
	return null
}

function createReferenceDataObject<T extends 'pair'>({
	page = '',
	parent,
	type,
	isKey,
	value,
}: {
	page: string
	parent: YAMLNode
	type: T
	isKey?: boolean
	value: string
}): t.DataObject {
	const reference = value

	switch (type) {
		case 'pair':
			if (isKey) {
				return {
					isActionChain: Identify.actionChain(parent),
					isDataKey: null,
					isKey,
					isFunction: null,
					location: 'unknown',
					operator: getOperators(reference),
					page,
					parent,
					reference,
					value,
				} as t.DataObject
			} else {
				// isValue
				return {
					isActionChain: Identify.actionChain(parent),
					isDataKey: null,
					isKey,
					isFunction: null,
					location: 'unknown',
					operator: getOperators(reference),
					page,
					parent,
					reference,
					value,
				}
			}
	}
}

function getOperators(v = ''): t.Operator[] {
	return u.reduce(
		u.entries(getOperators.map),
		(acc, [op, fn]) => {
			u.array(fn).forEach((f) => f(v) && acc.push(op as any))
			return acc
		},
		[],
	)
}

function getReference({
	root,
	visitee,
	type,
	value,
}: {
	visitee: YAMLDocument
	root: Aggregator['root']
	type: t.ReferenceType
	value: string
}) {
	const path = Identify.reference.format(value)
	if (type === 'merge') {
		if (Identify.reference.isLocal(value)) {
			if (isMap(visitee) || isDocument(visitee)) {
				return visitee.getIn(path.split('.'))
			}
			return value
		} else {
			const [rootKey, ...paths] = path.split('.')
			const rootObject = root.get(rootKey)
			if (rootObject) {
				if (isMap(rootObject) || isDocument(rootObject)) {
					return rootObject.getIn(paths)
				}
				if (isPair(rootObject))
					return getReference({
						...arguments[0],
						value: String(rootObject.value),
					})
			}
		}
	}
}

function getReferenceType(value: string): t.ReferenceType {
	if (Identify.reference.isRoot(value) || Identify.reference.isLocal(value)) {
		return 'merge'
	}
	if (Identify.reference.isAwaitingVal(value)) return 'await'
	if (Identify.reference.isEval(value)) return 'evolve'
	if (Identify.reference.isTilde(value)) return 'tilde'
	if (Identify.reference.isTraverse(value)) return 'traverse'
	return 'unknown'
}

const doc = nc.loadFileAsDoc(
	path.join(__dirname, '../generated/meet4d/SignIn.yml'),
)

;(async () => {
	try {
		const { doc, raw: yml } = await this.agg.init({
			loadPages: false,
			loadPreloadPages: false,
		})
		const preloadPages = await this.agg.loadPreloadPages()
	} catch (error) {
		console.error(error)
	}
})()

const visitorFactory = createVisitorFactory(CONFIG)

const composedVisitors = (context: {
	name: string
	visitee: YAMLNode | YAMLDocument
	root: Aggregator['root']
}): t.VisitFn => visitorFactory.compose(actionsVisitor)

visitor
	.init()
	.then(() => {
		for (const [name, visitee] of visitor.agg.root) {
			visitorFactory.visit.call(
				visitee,
				{ name, visitee, root: visitor.agg.root },
				composedVisitors({ name, visitee, root: visitor.agg.root }),
			)
		}
		return fs.writeJson(paths.metadata, actionsVisitor.data, { spaces: 2 })
	})
	.catch(console.error)

const evalObject = {
	actionType: 'evalObject',
	object: '..name',
}
