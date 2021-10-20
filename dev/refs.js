import * as u from '@jsmanifest/utils'
import * as nt from 'noodl-types'
import curry from 'lodash/curry.js'
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
const dir = `./data/${config}`

const agg = new Aggregator(config)

agg.root.set(
	'SignIn',
	parseDocument(
		fs.readFileSync(path.resolve(path.join(dir, 'SignIn_en.yml')), 'utf8'),
		{
			logLevel: 'debug',
		},
	),
)

const data = {
	actionTypes: [],
	componentTypes: [],
	contentTypes: [],
	dataKey: [],
	funcName: [],
	goto: [],
	listObject: [],
	paths: [],
	placeholder: [],
	popUpViews: [],
	texts: [],
	viewTags: [],
	emit: {},
}

// agg
// 	.init({
// 		dir,
// 		loadPages: true,
// 		loadPreloadPages: true,
// 		spread: ['BaseCSS', 'BaseDataModel', 'BasePage'],
// 	})
// 	.then(async (doc) => {

// 	})
// 	.catch(console.error)

/**
 * @typedef { Parameters<Extract<Parameters<typeof visit>[1], Function>>[0] } VisitKey
 */

const createDataFn = curry(
	/**
	 *
	 * @param { (store: typeof data, fns: ((store: typeof data, key: VisitKey, node: N, path: YAMLNode[]) => void)[]) => any } fn
	 * @param { typeof data } store
	 * @param { ((store: typeof data, node: N) => void)[] } fns
	 * @returns { <N extends YAMLNode>(key: VisitKey, node: N, path: YAMLNode[]) => void }
	 */
	function (fn, store, fns) {
		return fn(store, fns)
	},
)

const createPairFn = curry(
	/**
	 *
	 * @param { (store: typeof data, key: VisitKey, node: Pair, path: YAMLNode[]) => any } fn
	 * @returns { (store: typeof data, key: VisitKey, node: Pair, path: YAMLNode[]) => any }
	 */
	function (fn) {
		return curry(function (store, key, node, path) {
			if (isPair(node)) fn(store, key, node, path)
		})
	},
)

const createDataStoreFn = createDataFn(function (data, funcs) {
	const fns = u.callAll(...funcs)

	return function (key, node, path) {
		fns(data, key, node, path)
	}
})

/**
 * @param { string } key
 * @param { string } dataProp
 */
const createGetPairKeyValue = function (keyProp, dataProp) {
	return createPairFn((data, key, node, path) => {
		if (node.key.value === keyProp && isScalar(node.value)) {
			if (!data[dataProp]) data[dataProp] = []
			if (!data[dataProp].includes(node.value.value)) {
				data[dataProp].push(node.value.value)
			}
		}
	})
}

const getActionType = createGetPairKeyValue('actionType', 'actionTypes')
const getContentType = createGetPairKeyValue('contentType', 'contentTypes')
const getDataKey = createGetPairKeyValue('dataKey', 'dataKey')
const getFuncName = createGetPairKeyValue('funcName', 'funcName')
const getGotoDestinations = createGetPairKeyValue('goto', 'goto')
const getListObjects = createGetPairKeyValue('listObject', 'listObject')
const getPaths = createGetPairKeyValue('path', 'paths')
const getPlaceholder = createGetPairKeyValue('placeholder', 'placeholder')
const getPopUpView = createGetPairKeyValue('popUpView', 'popUpViews')
const getText = createGetPairKeyValue('text', 'texts')
const getViewTag = createGetPairKeyValue('viewTag', 'viewTags')

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
	getText,
	getViewTag,
])

visit(agg.root.get('SignIn'), function (key, node, path) {
	composedFn(key, node, path)

	if (isMap(node)) {
		if (node.has('emit')) {
			const keyNode = path[path.length - 2]
			let key
			if (isPair(keyNode)) {
				key = keyNode.key.value
				if (key) {
					const emitObject = keyNode.value.get(0)?.get?.('emit')?.toJSON()
					if (!data.emit[key]) data.emit[key] = []
					data.emit[key].push(emitObject)
				}
			}
		}

		if (node.has('type') && (node.has('children') || node.has('style'))) {
			const componentType = node.get('type')
			if (!data.componentTypes.includes(componentType)) {
				data.componentTypes.push(componentType)
			}
		}
	}
})

await fs.writeJson(`./data/data.json`, data, { spaces: 2 })
