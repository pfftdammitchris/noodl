import * as u from '@jsmanifest/utils'
import * as nt from 'noodl-types'
import curry from 'lodash/curry.js'
import get from 'lodash/get.js'
import has from 'lodash/has.js'
import set from 'lodash/set.js'
import flowRight from 'lodash/flowRight.js'
import Aggregator from 'noodl-aggregator'
import yaml from 'yaml'
import fs from 'fs-extra'
import path from 'path'

const {
	isScalar,
	isPair,
	isMap,
	isSeq,
	isDocument,
	isNode,
	Node: YAMLNode,
	Scalar,
	Pair,
	parseDocument,
	Document: YAMLDocument,
	stringify,
	YAMLMap,
	YAMLSeq,
	visit,
} = yaml

const config = 'meetd2'
const configUrl = `https://public.aitmed.com/config/${config}.yml`
const dir = `./generated/admind2/${config}`
const agg = new Aggregator(config)
const data = {}

agg
	.init({
		dir,
		loadPages: true,
		loadPreloadPages: true,
		spread: ['BaseCSS', 'BaseDataModel', 'BasePage'],
	})
	.then(() => start(agg))
	.then(() => done(data))
	.catch(console.error)

/**
 * @typedef { VisitArgs[0] } VisitKey
 * @typedef { VisitArgs[1] } VisitNode
 * @typedef { VisitArgs[2] } VisitPath
 * @typedef { Parameters<import('yaml').visitorFn<any>> } VisitArgs
 * @typedef { typeof data } Store
 * @typedef { <N extends VisitNode>(store: Store, key: VisitKey, node: N, path: VisitPath) => void } DataFn
 */

const makeDataFnFactory = curry(
	/**
	 * @param { Store } store
	 */
	(store) => (fn) => {}
)

/**
 *
 * @param { DataFn[] } fns
 * @returns { DataFn }
 */
const createDataStoreFn = function (fns) {
	const composedFns = u.callAll(...fns)
	return (...args) => composedFns(...args)
}

const createFn = makeDataFnFactory(
	function(store, fns) {

	}
	/**
	 * @param { object } options
	 * @param { string } options.dataPath
	 * @param { DataFn } options.transform
	 * @param { (store: Store, ...args: VisitArgs) => boolean } options.shouldPass
	 */
	function (options) {
		const { transform, dataPath, shouldPass } = options

		/**
		 * @param { (store: Store, ...args: VisitArgs) => boolean } shouldPass
		 * @param { DataFn } fn
		 */
		return curry(
			/**
			 * @param { Store } store
			 * @param { VisitKey } key
			 * @param { VisitNode } node
			 * @param { VisitPath } path
			 */
			function (store, key, node, path) {
				if (shouldPass(store, key, node, path)) {
					const result = transform(store, key, node, path)
					if (!u.isNil(result)) {
						!has(store, dataPath) && set(store, dataPath, [])
						const arr = get(store, dataPath)
						!arr.includes(result) && arr.push(result)
					}
				}
			},
		)
	},
)

const createDataFn = makeDataFnFactory(data)



const getByKeyValue = createDataFn((store) => {
	return (key, node, path) => {

	}
})

const getActionType = createFn('actionType')
const getContentType = createFn('contentType')
const getDataKey = createFn('dataKey')
const getFuncName = createFn('funcName')
const getGotoDestinations = createFn('goto.string')
const getListObjects = createFn('listObject')
const getPaths = createFn('path')
const getPlaceholder = createFn('placeholder')
const getPopUpView = createFn('popUpView')
const getText = createFn('text')
const getViewTag = createFn('viewTag')

const getEmit = createFn('emit', (store, key, node, path) => {
	if (isMap(node) && node.has('emit')) {
	}
})

const composedFn = createDataStoreFn(data, [
	getActionType,
	getContentType,
	getDataKey,
	getFuncName,
	getGotoDestinations,
	getListObjects,
	getPaths,
	getPlaceholder,
	getPopUpView,
	getViewTag,
])

/**
 *
 * @param { Aggregator } agg
 */
async function start(agg) {
	try {
		for (const [name, doc] of agg.root) {
			visit(doc, function (key, node, path) {
				composedFn(key, node, path)

				if (isMap(node)) {
					if (node.has('emit')) {
						const keyNode = path[path.length - 2]
						if (isPair(keyNode)) {
							if (keyNode.key.value) {
								const key = keyNode.key.value
								const emitObject = keyNode.value.get(0)?.toJSON()
								if (!data.emit) data.emit = {}
								if (!data.emit[key]) data.emit[key] = []
								data.emit[key].push(emitObject)
							}
						}
					}

					if (node.has('type') && (node.has('children') || node.has('style'))) {
						const type = node.get('type')
						if (!data.componentType) data.componentType = []
						if (!data.componentType.includes(type)) {
							data.componentType.push(type)
						}
					}
				}
			})
		}
	} catch (error) {
		if (error instanceof Error) throw error
		throw new Error(String(error))
	}
}

async function done(data) {
	try {
		await fs.writeJson(`./data/data.json`, data, { spaces: 2 })
	} catch (error) {
		if (error instanceof Error) throw error
		throw new Error(String(error))
	}
}

// start(agg).then(done).catch(console.error)
