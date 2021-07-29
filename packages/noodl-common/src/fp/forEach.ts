import * as u from '@jsmanifest/utils'
import yaml from 'yaml'

function forEach<V extends yaml.YAMLSeq<any> | any[]>(
	value: V,
	fn: (
		value: V extends yaml.YAMLSeq
			? V['items'][number]
			: V extends any[]
			? V[number]
			: undefined,
		index: number,
		collection: yaml.YAMLSeq<any> | any[],
	) => void,
) {
	if (yaml.isSeq(value)) {
		value.items.forEach((item, i, coll) => fn(item, i, coll))
	} else if (u.isArr(value)) {
		value.forEach(fn)
	}
}

export default forEach
