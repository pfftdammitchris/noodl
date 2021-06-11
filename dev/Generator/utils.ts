import * as u from '@jsmanifest/utils'

export function isSerializableStr(value: unknown) {
	return u.isStr(value) && /^[a-zA-Z]+[0-9]+/.test(value)
}
