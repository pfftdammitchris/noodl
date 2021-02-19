import { YAMLMap, YAMLSeq } from 'yaml/types'
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
