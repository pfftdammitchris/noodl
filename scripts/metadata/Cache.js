import * as u from '@jsmanifest/utils'

/**
 * @typedef { Map<string, any> } ICache
 */

class Cache {
	/** @type { ICache } */
	#cache = new Map()

	/**
	 * @param { string } key
	 * @param { any } [initialValue]
	 */
	#getOrCreate = (key, initialValue) => {
		if (!this.#cache.has(key)) this.#cache.set(key, initialValue)
		return this.#cache.get(key)
	};

	[Symbol.iterator]() {
		const entries = [...this.#cache.entries()]
		return {
			next() {
				let value = entries.shift()
				return {
					value,
					done: !entries.length,
				}
			},
		}
	}

	[Symbol.for('nodejs.util.inspect.custom')]() {
		const result = {}
		for (const [key, value] of this.#cache.entries()) {
			result[key] = value
		}
		return result
	}

	/**
	 * @param { string } key
	 * @param { any } value
	 */
	create(key, value) {
		return this.#getOrCreate(key, value)
	}

	/**
	 * @param { string } key
	 */
	get(key) {
		return this.#getOrCreate(key)
	}

	/**
	 * @param { string } key
	 * @param { any } value
	 */
	set(key, value) {
		this.#cache.set(key, value)
	}

	/**
	 * @param { string } key
	 */
	remove(key) {
		this.#cache.has(key) && this.#cache.delete(key)
	}

	toString() {
		return JSON.stringify([...this], null, 2)
	}
}

export default Cache
