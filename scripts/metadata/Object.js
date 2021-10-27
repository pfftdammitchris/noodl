import * as u from '@jsmanifest/utils'
import { Identify } from 'noodl-types'

class ObjectValue extends Object {
	type = 'object'
	value

	/**
	 * @param { Record<string, any> } value
	 */
	constructor(value) {
		super(value)
		this.value = value
	}

	get length() {
		return this.keys.length
	}

	get keys() {
		return u.keys(this.value)
	}

	get values() {
		return this.keys.map((key) => this.value[key])
	}

	hasReferenceKeys() {
		return this.keys.some((key) => Identify.reference(key))
	}

	hasReferenceValues() {
		return u
			.values(this.value)
			.some((value) => u.isStr(value) && Identify.reference(value))
	}

	toJSON() {
		return Object.entries(this.value).reduce((acc, [key, value]) => {
			acc[key] = value
			return acc
		}, {})
	}

	toString() {
		return JSON.stringify(this.value, null, 2)
	}
}

export default ObjectValue
