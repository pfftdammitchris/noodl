import * as u from '@jsmanifest/utils'
import yaml from 'yaml'
import _set from 'lodash.set'

function set<O extends Record<string, any>, K extends keyof O>(
	obj: O,
	key: K,
	value: any,
) {
	if (yaml.isMap(obj)) {
		obj.set(key, value)
	} else if (u.isObj(obj)) {
		_set(obj, key, value)
	}
}

export default set
