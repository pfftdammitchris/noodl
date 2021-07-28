import * as u from '@jsmanifest/utils'
import yaml from 'yaml'
import toString from './toString'

function assign<N extends yaml.YAMLMap | Record<string, any>>(
	value: N,
	...rest: yaml.YAMLMap[]
): N {
	if (yaml.isMap(value)) {
		for (const map of rest) {
			for (const item of map.items) {
				value.set(toString(item), item.value)
			}
		}
	} else if (u.isObj(value)) {
		u.assign(value, ...rest)
	}
	return value
}

export default assign
