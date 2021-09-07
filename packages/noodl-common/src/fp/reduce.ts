import * as u from '@jsmanifest/utils'
import _get from 'lodash.get'
import _set from 'lodash.set'
import yaml from 'yaml'

function reduce<V extends yaml.YAMLSeq | any[], Acc = any>(
	value: V,
	fn: (acc: Acc, v: V) => Acc,
	initialValue: Acc,
) {
	if (yaml.isSeq(value)) return u.reduce(value.items as any, fn, initialValue)
	return u.reduce(value, fn, initialValue)
}

export default reduce
