import ArrayValue from './Array.js'
import BooleanValue from './Boolean.js'
import ObjectValue from './Object.js'
import NumberValue from './Number.js'
import StringValue from './String.js'

/**
 * @typedef { 'array' | 'boolean' | 'null' | 'object' | 'number' | 'string' | 'undefined' } NoodlDataType
 * @typedef { ArrayValue | BooleanValue | ObjectValue | NumberValue | StringValue } NoodlValue
 */

class Property {
	/** @type { NoodlDataType } */
	type
	/** @type { NoodlValue } */
	value

	constructor(value) {
		this.type = typeof value
		if (this.type === 'object' && value === null) this.type = 'null'
		this.value =
			this.type === 'boolean'
				? new BooleanValue(value)
				: this.type === 'number'
				? new NumberValue(value)
				: this.type === 'object'
				? new ObjectValue(value)
				: this.type === 'string'
				? new StringValue(value)
				: value
	}
}

export default Property
