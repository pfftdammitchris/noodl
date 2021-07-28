import * as u from '@jsmanifest/utils'
import { isMap, YAMLMap } from 'yaml'
import toString from './toString'
import { KeyOf, ValueOf } from '../types'

function entries<N extends YAMLMap>(v: N): [key: KeyOf<N>, value: ValueOf<N>][]

function entries<O extends Record<string, any>>(
	v: O,
): [key: keyof O, value: O[keyof O]][]

function entries<N extends YAMLMap | Record<string, any>>(value: N) {
	if (isMap(value)) {
		return value.items.map((item) => [toString(item), item.value])
	} else if (u.isObj(value)) {
		return u.entries(value)
	}
	return []
}

export default entries
