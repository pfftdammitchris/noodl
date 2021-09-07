import yaml from 'yaml'
import * as u from '@jsmanifest/utils'
import reduce from './reduce.js'

function flat<V = any>(value: V[]): V[] {
	return reduce(
		value,
		(acc, v) => {
			// @ts-expect-error
			if (u.isArr(v)) acc.push(...flat(v))
			// @ts-expect-error
			if (yaml.isSeq(v)) acc.push(...v.items)
			return acc
		},
		[],
	)
}

export default flat
