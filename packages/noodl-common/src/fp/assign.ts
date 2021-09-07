import * as u from '@jsmanifest/utils'
import yaml, { YAMLMap } from 'yaml'
import _get from 'lodash.get'
import _set from 'lodash.set'
import forEach from './forEach.js'
import set from './set.js'

function toMap<V = any>(value: V): yaml.YAMLMap {
	if (yaml.isMap(value)) return value
	if (u.isObj(value)) {
		const map = new YAMLMap()
		u.entries(value).forEach(([k, v]) => map.set(k, v))
		return map
	}
	return new yaml.Document(value).contents as YAMLMap
}

function assign<N extends yaml.YAMLMap | Record<string, any>>(
	value: N,
	...rest: (yaml.YAMLMap | Record<string, any>)[]
): N {
	if (yaml.isMap(value)) {
		forEach(value, (item: yaml.Pair) =>
			// @ts-expect-error
			set(value, yaml.isScalar(item) ? item : String(item), toMap(item.value)),
		)
	} else if (u.isObj(value)) {
		u.assign(value, ...rest)
	}
	return value
}

export default assign
