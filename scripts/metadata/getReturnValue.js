import ObjectValue from './Object.js'
import StringValue from './String.js'

export default function getReturnValue(value) {
	switch (typeof value) {
		case 'object':
			return new ObjectValue(value)
		case 'string':
			return new StringValue(value)
		default:
			return value
	}
}
