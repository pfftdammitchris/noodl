import { YAMLMap, YAMLSeq } from 'yaml/types'
import * as c from '../../../src/constants'
import * as d from '../../../src/utils/doc'
import * as u from './internal'
import { isActionLike, isEmitObject, isGotoObject, isToastObject } from './map'

export function isActionChain(node: YAMLSeq) {
	return node.items.some((value) => {
		if (value instanceof YAMLMap) {
			return [
				isEmitObject,
				isGotoObject,
				isToastObject,
				isActionLike,
			].some((fn) => fn(value))
		}
		return false
	})
}
