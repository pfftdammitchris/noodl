import * as u from '@jsmanifest/utils'
import * as nt from 'noodl-types'
import get from 'lodash/get.js'
import has from 'lodash/has.js'
import set from 'lodash/set.js'
import Aggregator from 'noodl-aggregator'
import yaml from 'yaml'
import fs from 'fs-extra'
import path from 'node:path'
import meow from 'meow'
import NoodlMetadata from './NoodlMetadata.js'
import Actions from './Actions.js'
import Cache from './Cache.js'

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
	YAMLMap,
	YAMLSeq,
	visit,
	C,
} = yaml

const firebaseConfig = {
	apiKey: 'AIzaSyAOfZtjW1AwASUlj9Uv7viAawWerPx_TbI',
	authDomain: 'aitmed-dev.firebaseapp.com',
	projectId: 'aitmed-dev',
	storageBucket: 'aitmed-dev.appspot.com',
	messagingSenderId: '958291731658',
	appId: '1:958291731658:web:c688e785f71a9553b6c033',
}

const firebaseCredentials = fs.readJsonSync(
	path.resolve(
		path.join(
			process.cwd(),
			'aitmed-dev-firebase-adminsdk-c0ao1-79b04cd527.json',
		),
	),
)

const log = console.log

const cli = meow('', {
	flags: {
		atype: { type: 'string', default: 'get' },
		properties: { type: 'string' },
	},
})

const config = 'meetd2'
const configUrl = `https://public.aitmed.com/config/${config}.yml`
const dir = `./generated/admind2/${config}`
const agg = new Aggregator(config)
const data = {}

/**
 * @typedef { object } Cache
 * @property { object } Cache.actions
 * @property { Record<string, { actionType: string; knownProperties }> } } Cache.actions
 * @property { object } Cache.components
 * @property { string[] } Cache.components.type
 */

/**
 * @param { Partial<Cache> } [cache]
 * @returns { Cache }
 */
function createCache() {
	const obj = new Cache()
	return obj
}

class NoodlData {
	#cache = createCache()
	/** @type { object } */
	#credentials
	/** @type { NoodlMetadata } */
	#metadata
	/** @type { FirebaseFirestore.Firestore } */
	#db

	/**
	 *
	 * @param { object } options
	 * @param { object } options.credentials
	 */
	constructor(options) {
		this.#credentials = options.credentials
		this.#metadata = new NoodlMetadata({
			credentials: {
				firebase: {
					serviceAccount: this.#credentials,
				},
			},
		})
		this.#db = this.#metadata.getDb()
	}

	/**
	 * @param { string } actionType
	 * @param { string | string[] } [properties]
	 */
	async createActionType(actionType, properties) {
		try {
			properties = u.array(properties)
			let action = this.get(actionType, properties)
			if (!action) action = this.add(actionType, properties)
			return this.#db.collection('actions').doc(actionType).create({
				actionType: action.actionType.value,
				properties: action.properties.value,
			})
		} catch (error) {
			console.error(error)
			throw error
		}
	}

	async fetchActions() {
		return this.#db.collection('actions').listDocuments()
	}

	async fetchActionTypes() {
		try {
			return Promise.all((await this.getActions()).map((obj) => obj.id))
		} catch (error) {
			throw error
		}
	}
}

const ndata = new NoodlData({
	credentials: firebaseCredentials,
})

// agg
// 	.init({
// 		dir,
// 		loadPages: true,
// 		loadPreloadPages: true,
// 		spread: ['BaseCSS', 'BaseDataModel', 'BasePage'],
// 	})
// .then(() => start(agg))
// .then(() => done(data))
// .catch(console.error)

/**
 * @typedef { VisitArgs[0] } VisitKey
 * @typedef { VisitArgs[1] } VisitNode
 * @typedef { VisitArgs[2] } VisitPath
 * @typedef { Parameters<import('yaml').visitorFn<any>> } VisitArgs
 * @typedef { typeof data } Store
 * @typedef { <N extends VisitNode>(store: Store, key: VisitKey, node: N, path: VisitPath) => void } DataFn
 */

/**
 * @typedef { import('@jsmanifest/typefest').OrArray } OrArray
 * @typedef { key: string; type?: 'string' | 'number' | 'boolean' | 'object' | 'array' } PairedWithConfig
 * @typedef { { key: string; value?: any; pairedWith?: PairedWithConfig | PairedWithConfig[] } } KeyConfig
 * @typedef { (node: YAMLMap) => boolean } KeyConfigPredicateFn
 */

/**
 * @param { Store } store
 * @param { DataFn[] } fns
 * @returns { (...args: VisitArgs) => void }
 */
const createDataStoreFn = function (store, fns) {
	const composedFns = u.callAll(...fns)
	return (...args) => composedFns(store, ...args)
}

const createFn =
	/**
	 * @param { ((store: Store; key: VisitKey, node: VisitNode, path: VisitPath) => boolean) | 'scalar' | 'pair' | 'map' | 'seq' } shouldPass
	 * @param { DataFn } callback
	 */
	function (shouldPass, callback) {
		/** @param  { ...args: Parameters<DataFn> } args */
		return function (...args) {
			if (u.isStr(shouldPass)) {
				args[1] === shouldPass && callback(...args)
			} else if (u.isFnc(shouldPass)) {
				shouldPass(...args) && callback(...args)
			}
		}
	}

/**
 * @param { string | string[] | KeyConfig | (string | string[] | KeyConfig)[] } options
 * @param { (keyword: string, ...args: Parameters<DataFn<YAMLMap>>) => void } callback
 */
const createGetObjectsWithKeys = function (options, callback) {
	/**
	 * @param { KeyConfig } keyConfig
	 */
	function handleKeyConfig(keyConfig) {
		if (!keyConfig.key)
			throw new Error(`"key" in KeyConfig is null or undefined`)

		const isPairedWith = (node, pairedWith) => {
			const pairedTests = u.array(pairedWith)
			if (!pairedTests.length) return true
			return pairedTests.some(({ key = '', type }) => {
				const pathArr = key?.split('.') || []
				const value = node.getIn(pathArr)?.toJSON?.()
				if (node?.hasIn?.(pathArr)) {
					if (config.type) {
						switch (config.type) {
							case 'string':
							case 'number':
								return (
									isScalar(value) &&
									u[type === 'string' ? 'isStr' : 'isNum'](value)
								)
							case 'object':
								return isMap(value)
							case 'array':
								return isSeq(value)
							default:
								return false
						}
					}
					return true
				}
				return false
			})
		}

		return {
			keyword: keyConfig.key,
			fn: (store, key, node, path) => {
				const paths = u.isStr(path) ? path.split('.') : path
				if (isMap(node)) {
					if (keyConfig.pairedWith) {
						if (!isPairedWith(node, keyConfig.pairedWith)) {
							return false
						}
						return true
					}
					return node.hasIn(paths)
				}
				return true
			},
		}
	}

	/**
	 * @param { OrArray<string | KeyConfig> } value
	 */
	function handleKeyConfigOrKeyword(value) {
		return u.map((configOrKeyword) => {
			if (u.isArr(configOrKeyword)) {
				return u.map(handleKeyConfigOrKeyword, configOrKeyword)
			}
			if (u.isStr(configOrKeyword)) {
				return {
					keyword: configOrKeyword,
					fn: (node) => node.hasIn(configOrKeyword.split('.')),
				}
			}
			return handleKeyConfig(configOrKeyword)
		}, u.array(value))
	}

	/**
	 * @type { { keyword: string; fn: (node: YAMLMap) => boolean }[] }
	 */

	const predFns = handleKeyConfigOrKeyword(options)

	return createFn(
		(store, _, node) => isMap(node),
		(store, key, node, path) => {
			const numFns = predFns.length
			for (let index = 0; index < numFns; index++) {
				const { keyword, fn } = predFns[index]
				fn(node) && callback(keyword, store, key, node, path)
			}
		},
	)
}

/**
 *
 * @param { string } key
 * @param { (store: Store, ...args: VisitArgs) => any } [transform]
 * @returns { DataFn }
 */
const getByKeyValue = function (key) {
	return createFn(
		(store, _, node) =>
			isPair(node) && isScalar(node.key) && node.key.value === key,
		(store, _, node) => {
			const result = node.value.value
			if (!u.isNil(result)) {
				!has(store, key) && set(store, key, [])
				const arr = get(store, key)
				!arr.includes(result) && arr.push(result)
			}
		},
	)
}

const getActionType = getByKeyValue('actionType')
const getContentType = getByKeyValue('contentType')
const getDataKey = getByKeyValue('dataKey')
const getEmit = getByKeyValue('emit')
const getFuncName = getByKeyValue('funcName')
const getGoto = getByKeyValue('goto')
const getIteratorVar = getByKeyValue('iteratorVar')
const getListObjects = getByKeyValue('listObject')
const getPaths = getByKeyValue('path')
const getPlaceholder = getByKeyValue('placeholder')
const getPopUpView = getByKeyValue('popUpView')
const getStyle = getByKeyValue('style')
const getText = getByKeyValue('text')
const getViewTag = getByKeyValue('viewTag')

/** @param { ...args: (string | KeyConfig)[] } args */
const getObjectsWithKeys = (...args) =>
	createGetObjectsWithKeys(
		args,
		/**
		 * @param { string } keyword
		 * @param { Store } store
		 * @param { VisitKey } key
		 * @param { YAMLMap } node
		 * @param { VisitPath } path
		 */
		(keyword, store, key, node) => {
			const result = node.toJSON()
			!has(store, keyword) && set(store, keyword, [])
			get(store, keyword)?.push?.(result)
		},
	)

const getLabelComponentsWithDataKey = getObjectsWithKeys({
	key: 'type',
	value: 'label',
	pairedWith: 'dataKey',
})

const composedFn = createDataStoreFn(data, [
	getActionType,
	getContentType,
	getDataKey,
	getFuncName,
	// getGoto,
	getIteratorVar,
	// getLabelComponentsWithDataKey,
	getListObjects,
	getPaths,
	getPlaceholder,
	getPopUpView,
	getViewTag,
])

const { flags, input = [] } = cli

;(async () => {
	try {
		u.newline()
		console.log({ input, flags })
		u.newline()

		if (flags.atype) {
			const command = flags.atype

			switch (command) {
				case 'create':
				case 'get':
				case 'update': {
					if (command === 'get') {
						const actionTypes = await ndata.getActionTypes()
						for (const actionType of actionTypes) {
							const logActionType = u.yellow(actionType)
							const logProperties = `Properties: ${
								properties.length
									? u.yellow(properties.join(', '))
									: `No properties`
							}`
							log(`${logActionType} - ${logProperties}`)
						}
						u.newline()
						break
					}

					const [actionType, properties = ''] = input

					if (actionType && u.isStr(actionType)) {
						const label = command
							.charAt(0)
							.toUpperCase()
							.concat(command.substring(1))
						const keys = properties.split(',')
						log(
							`${label} actionType "${u.yellow(actionType)}"${
								keys.length
									? ` with properties: ${u.yellow(keys.join(', '))}`
									: ''
							}`,
						)

						const result =
							command === 'create'
								? await db.createActionType(actionType, keys)
								: await db.updateActionTypeProperties(actionType, { add: keys })

						if ((u.isObj(result) && 'added' in result) || 'removed' in result) {
							log(`Added ${u.yellow(result.added.length)} properties`)
							log(`Removed ${u.yellow(result.removed.length)} properties`)
						} else {
							log(u.green(`Added "${actionType}" to the database`))
						}
					} else {
						throw new Error(`actionType was not provided`)
					}

					break
				}
				default: {
					throw new Error(
						`Invalid ${u.yellow(
							'--atype',
						)} command. Available values: ${u.yellow(
							['create', 'get', 'update'].join(', '),
						)}`,
					)
				}
			}
		} else {
			//
		}
	} catch (error) {
		if (error instanceof Error) {
			console.error(
				`[${u.yellow(error.name)}] ${u.red(error.message)}`,
				error.stack,
			)
			process.exit(0)
		}
		throw new Error(u.red(String(error)))
	}
})()
