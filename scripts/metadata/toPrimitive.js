import ArrayValue from './Array.js'
import BooleanValue from './Boolean.js'
import NumberValue from './Number.js'
import ObjectValue from './Object.js'
import StringValue from './String.js'

function toPrimitive(value) {
	if (Array.isArray(value)) return new ArrayValue(value)
	switch (typeof value) {
		case 'boolean':
			return new BooleanValue(value)
		case 'number':
			return new NumberValue(value)
		case 'object':
			return new ObjectValue(value)
		case 'string':
			return new StringValue(value)
		default:
			return null
	}
}

export default toPrimitive
