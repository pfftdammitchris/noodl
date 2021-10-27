import * as u from '@jsmanifest/utils'
import Cache from './Cache.js'
import ArrayValue from './Array.js'
import BooleanValue from './Boolean.js'
import ObjectValue from './Object.js'
import NumberValue from './Number.js'
import StringValue from './String.js'
import getReturnValue from './getReturnValue.js'
import toPrimitive from './toPrimitive.js'
import toJSON from './toJSON.js'

/**
 * @typedef { object } ActionCacheObject
 * @property { StringValue } ActionCacheObject.actionType
 * @property { ArrayValue } ActionCacheObject.properties
 *
 * @typedef { Map<string, ActionCacheObject> } ActionCache
 */

class Actions {
	/** @type { ActionCache } */
	#cache = new Cache();

	[Symbol.for('nodejs.util.inspect.custom')]() {
		return this.toJSON()
	}

	/**
	 * @param { string } actionType
	 */
	has(actionType) {
		return this.#cache.has(actionType)
	}

	/**
	 * @param { string } actionType
	 */
	get(actionType) {
		return this.#cache.get(actionType)
	}

	/**
	 * @param { string } actionType
	 * @param { string | string[] } [properties]
	 */
	add(actionType, properties) {
		let action = this.#cache.get(actionType)

		if (!action) {
			this.#cache.set(actionType, {
				actionType: getReturnValue(actionType),
				properties: [],
			})

			action = this.#cache.get(actionType)
		}

		for (const key of u.array(properties)) {
			if (!key) continue
			if (!action.properties.includes(key)) {
				action.properties.push(getReturnValue(key))
			}
		}

		return action
	}

	toJSON() {
		return u.reduce(
			[...this.#cache],
			(acc, [key, obj]) => {
				acc[key] = toJSON(getReturnValue(obj))
				return acc
			},
			{},
		)
	}
}

const actions = new Actions()
actions.add('builtIn')
actions.add('popUp', 'popUpView')
actions.add('evalObject', ['actionType', 'object'])

console.log(actions)

export default Actions
