import * as u from '@jsmanifest/utils'
import * as nc from 'noodl-common'
import * as nu from 'noodl-utils'
import flowRight from 'lodash.flowright'
import path from 'path'
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
		Identify.reference(key) && (key = nu.trimReference(key))
		const [firstKey = '', ...rest] = key.split('.')
		if (firstKey) {
			const local = firstKey[0].toLowerCase() === firstKey[0]
			if (local) {
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
	const path = nu.trimReference(value)
	if (type === 'merge') {
		if (Identify.localReference(value)) {
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
	if (Identify.rootReference(value) || Identify.localReference(value)) {
		return 'merge'
	}
	if (Identify.awaitReference(value)) return 'await'
	if (Identify.evalReference(value)) return 'evolve'
	if (Identify.tildeReference(value)) return 'tilde'
	if (Identify.traverseReference(value)) return 'traverse'
	return 'unknown'
}

const doc = nc.loadFileAsDoc(
	path.join(__dirname, '../generated/meet4d/SignIn.yml'),
)

const aggregator = new Aggregator('meetd2')

const visitorFactory = createVisitorFactory(CONFIG)

aggregator
	.init({
		loadPages: true,
		loadPreloadPages: true,
		spread: ['BaseCSS', 'BasePage', 'BaseDataMode'],
	})
	.then(() => {
		const evalObjects = {
			arrays: [],
			booleans: [],
			objects: [],
			numbers: [],
			strings: [],
		}

		const userEvents = {
			onClick: [],
		}

		for (const [name, visitee] of aggregator.root) {
			YAMLVisit(visitee, {
				Pair: (key, node, path) => {
					if (node.key.value === 'onClick') {
						if (isSeq(node.value)) {
							userEvents.onClick.push(node.toJSON())
						}
					}
				},
				Map: (key, node, path) => {
					// evalObject action objects
					// if (node.get('actionType') === 'evalObject') {
					// 	const object = node.get('object')
					// 	if (isScalar(object)) {
					// 		if (evalObjects[typeof object]) {
					// 			evalObjects[typeof object].push(node.toJSON())
					// 		}
					// 	} else if (isMap(object)) {
					// 		evalObjects.objects.push(node.toJSON())
					// 	} else if (isSeq(object)) {
					// 		evalObjects.arrays.push(node.toJSON())
					// 	}
					// }
				},
			})
		}
		return fs.writeJson(paths.metadata, userEvents, { spaces: 2 })
	})
	.catch(console.error)

const evalObject = {
	actionType: 'evalObject',
	object: '..name',
}
