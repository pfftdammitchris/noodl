import yaml from 'yaml'
import * as u from '@jsmanifest/utils'
import reduce from './reduce'

function flat<V = any>(value: V[]): V[] {
	return reduce(
		value,
		(acc, v) => {
			if (u.isArr(v)) acc.push(...flat(v))
			if (yaml.isSeq(v)) acc.push(...v.items)
			return acc
		},
		[],
	)
}

export default flat
