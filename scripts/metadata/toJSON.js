import ArrayValue from './Array.js'
import BooleanValue from './Boolean.js'
import NumberValue from './Number.js'
import ObjectValue from './Object.js'
import StringValue from './String.js'

/**
 * @param { ArrayValue | BooleanValue | NumberValue | ObjectValue | StringValue } value
 */
function toJSON(value) {
	if (!value) return value
	if (typeof value === 'boolean') return value
	if (typeof value === 'number') return value
	if (value instanceof StringValue) return value.toString()
	if (value instanceof ObjectValue) return value.toJSON()
	if (Array.isArray(value)) return value.map((val) => toJSON(val))

	if (typeof value !== 'object' || typeof value === 'function') {
		return value
	}

	if ('toJSON' in value) return value.toJSON()
	return JSON.parse(JSON.stringify(value, null, 2))
}

export default toJSON
