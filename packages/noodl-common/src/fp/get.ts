import * as u from '@jsmanifest/utils'
import yaml from 'yaml'
import _get from 'lodash.get'
import toString from './base/toString.js'

function get<O extends Record<string, any> | yaml.YAMLMap>(
	value: O,
	key: string | yaml.Scalar,
) {
	if (yaml.isMap(value)) {
		return value.getIn(u.array(key).map((k) => toString(k).split('.')))
	} else if (u.isObj(value)) {
		// @ts-expect-error
		return _get(value, key)
	}
}

export default get
