import * as u from '@jsmanifest/utils'
import * as nt from 'noodl-types'
import { GraphQLClient, request, gql } from 'graphql-request'
import curry from 'lodash/curry.js'
import get from 'lodash/get.js'
import has from 'lodash/has.js'
import set from 'lodash/set.js'
import flowRight from 'lodash/flowRight.js'
import Aggregator from 'noodl-aggregator'
import yaml from 'yaml'
import fs from 'fs-extra'
import path from 'path'
import meow from 'meow'

const log = console.log
const cli = meow('', {
	flags: {
		atype: { type: 'string', default: 'get' },
		properties: { type: 'string' },
	},
})

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
} = yaml

const config = 'meetd2'
const configUrl = `https://public.aitmed.com/config/${config}.yml`
const dir = `./generated/admind2/${config}`
const agg = new Aggregator(config)
const data = {}

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
		(store, _, node, path) => {
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
// const getGoto = getByKeyValue('goto')
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

/**
 *
 * @param { Aggregator } agg
 */
async function start(agg) {
	try {
		for (const [name, doc] of agg.root) {
			visit(doc, function (key, node, path) {
				composedFn(key, node, path)
			})
		}
		return data
	} catch (error) {
		if (error instanceof Error) throw error
		throw new Error(String(error))
	}
}

async function done(data) {
	try {
		if (!data) return console.log(u.yellow(`Done, but with no data`))
		await fs.writeJson(`./data/data.json`, data, { spaces: 2 })
	} catch (error) {
		if (error instanceof Error) throw error
		throw new Error(String(error))
	}
}

// start(agg)

// postgres://abkxzivnrcrnkl:2e52ac34f476e57b51e5ba017f8bc2642a88a8d15037e28ff7bb3a61e9cb5dee@ec2-3-233-100-43.compute-1.amazonaws.com:5432/d5qdkdfonbm2jr
// Hasura console domain ecos-noodl.hasura.app

class GraphqlDB {
	appName = 'ecos-noodl'
	endpoint = `https://${this.appName}.hasura.app/v1/graphql`
	adminSecret = ''
	personalAccessToken = ''
	graphqlClient = new GraphQLClient(this.endpoint)

	constructor({ adminSecret, personalAccessToken }) {
		this.adminSecret = adminSecret
		this.personalAccessToken = personalAccessToken
	}

	/**
	 *
	 * @param { string } query
	 * @param { Record<string, any> | undefined } variables
	 */
	async send(query, variables) {
		const response = await this.graphqlClient.request(
			query,
			variables,
			this.getHeaders(),
		)
		return response
	}

	/**
	 * @param { Record<string, any> } [headers]
	 */
	getHeaders(headers) {
		return {
			Authorization: `pat ${this.personalAccessToken}`,
			'x-hasura-admin-secret': this.adminSecret,
			...headers,
		}
	}
}

const graphqldb = new GraphqlDB({
	adminSecret:
		'VzqnFhstCXpdPz6bl76kmALogk8n0dDxAm1Y6DFj2k7xcy25Dpu86HzSq5aG6wQo',
	personalAccessToken:
		'Gv654gYiq4YKgFbzIk4rJ2FkV1LiNyWGw1S7CMCrmPHVrahRYdzZCKkfvoSLP7NJ',
})

function createKeyValueCRUDApi(key) {
	const label = key.charAt(0).toUpperCase().concat(key.substring(1))

	async function create(args) {
		try {
			//
		} catch (error) {
			throw error
		}
	}

	async function get(args) {
		try {
			//
		} catch (error) {
			throw error
		}
	}

	async function remove(args) {
		try {
			//
		} catch (error) {
			throw error
		}
	}

	async function update(args) {
		try {
			//
		} catch (error) {
			throw error
		}
	}

	return {
		[`create${label}`]: create,
		[`get${label}`]: get,
		[`remove${label}`]: remove,
		[`update${label}`]: update,
	}
}

/**
 *
 * @param { GraphqlDB } graphqldb
 */
const GraphqldbAPI = function (graphqldb) {
	/**
	 * @param { string } actionType
	 * @param { string | string[] } [propertiesProp]
	 */
	async function createActionType(actionType, propertiesProp = []) {
		try {
			let isCreating = true
			let properties = u.array(propertiesProp)
			let { actions: currentActions } = await getActionTypes()
			let item = currentActions.find((o) => o.actionType === actionType)

			if (!item) item = { actionType, properties: [] }
			else isCreating = false

			if (!isCreating) {
				const newProperties = []

				for (const prop of properties) {
					if (prop && !newProperties.includes(prop)) newProperties.push(prop)
				}

				if (newProperties.length) {
					log(
						`Action type "${actionType}" already exists. Redirecting to updateActionTypeProperties instead`,
					)
					return updateActionTypeProperties(actionType, { add: newProperties })
				} else {
					throw new Error(
						`An item with action type "${actionType}" already exists in the database with all of the ${properties.length} properties provided`,
					)
				}
			}

			return graphqldb.send(
				gql`
					mutation ($actionType: String, $properties: json) {
						insert_actions_one(
							object: { actionType: $actionType, properties: $properties }
						) {
							properties
							actionType
						}
					}
				`,
				{ actionType, properties },
			)
		} catch (error) {
			console.error(error)
			throw error
		}
	}

	/**
	 * @param { string } actionType
	 * @param {{ add?: string | string[]; remove?: string | string[] }} properties
	 */
	async function updateActionTypeProperties(actionType, { add, remove }) {
		try {
			const { actions: currentActions } = await getActionTypes()
			const item = currentActions.find((o) => o.actionType === actionType)

			if (item) {
				const properties = [...item.properties]
				const added = []
				const removed = []

				if (add) {
					u.forEach((prop) => {
						if (!properties.includes(prop)) {
							added.push(prop)
							properties.push(prop)
						}
					}, u.array(add))
				}

				if (remove) {
					u.forEach((prop) => {
						if (properties.includes(prop)) {
							const index = properties.indexOf(prop)

							if (index > -1) {
								const prop = properties[index]
								properties.splice(index, 1)
								if (added.includes(prop)) {
									added.splice(added.indexOf(prop), 1)
									removed.push(prop)
								}
							}
						}
					}, u.array(remove))
				}

				await graphqldb.send(
					gql`
						mutation ($actionType: String!, $properties: json) {
							update_actions_by_pk(
								pk_columns: { actionType: $actionType }
								_set: { properties: $properties }
							) {
								properties
							}
						}
					`,
					{ actionType, properties },
				)

				return { added, removed }
			} else {
				throw new Error(
					`Action type "${actionType}" does not exist in the database`,
				)
			}
		} catch (error) {
			if (error instanceof Error) throw error
			throw new Error(String(error))
		}
	}

	/**
	 *
	 * @returns {Promise<{ actions: { actionType: string; properties: string[] }[]>}}
	 */
	async function getActionTypes() {
		try {
			return {
				actions:
					(
						await graphqldb.send(gql`
							query {
								actions {
									actionType
									properties
								}
							}
						`)
					)?.actions || [],
			}
		} catch (error) {
			throw error
		}
	}

	const o = {
		createActionType,
		getActionTypes,
		updateActionTypeProperties,
	}

	return o
}

const db = GraphqldbAPI(graphqldb)

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
						const { actions } = await db.getActionTypes()
						for (const { actionType, properties = [] } of actions) {
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
			console.error(`[${u.yellow(error.name)}] ${u.red(error.message)}`)
			process.exit(0)
		}
		throw new Error(u.red(String(error)))
	}
})()
