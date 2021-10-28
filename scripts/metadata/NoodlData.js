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

/**
 * @typedef { import('./types.js').Data } Data
 * @typedef { import('./types.js').DataItemDescriptor } DataItemDescriptor
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
	/** @type { Data } */
	#data
	/** @type { NoodlMetadata } */
	#metadata
	/** @type { FirebaseFirestore.Firestore } */
	#db

	/**
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

	get actions() {
		return this.#data.actions
	}

	get actionTypes() {
		return this.actions.actionTypes
	}

	get components() {
		return this.#data.components
	}

	get componentTypes() {
		return this.components.types
	}

	get deviceTypes() {
		return this.#data.deviceTypes
	}

	get styles() {
		return this.#data.styles
	}

	get references() {
		return this.#data.references
	}

	get userEvents() {
		return this.#data.userEvents
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
			return Promise.all((await this.fetchActions()).map((obj) => obj.id))
		} catch (error) {
			throw error
		}
	}
}

export default NoodlData
