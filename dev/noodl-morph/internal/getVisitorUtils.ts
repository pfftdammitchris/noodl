/**
 * All utilities in this file eventually get composed to form a single utilies
 * object passed to all visitors
 */
import yaml from 'yaml'
import { Node, Scalar, Pair, YAMLMap, YAMLSeq } from 'yaml/types'
import { YAMLNode } from '../../../src/types'
import { NoodlPage, NoodlRoot } from '../types'
import * as baseUtils from '../utils'
import * as T from '../types/internalTypes'

function getVisitorUtils({ pages, root }: T.InternalComposerBaseArgs) {
	const o = {
		canUseGetIn(node: any): node is YAMLMap | YAMLSeq | NoodlPage | NoodlRoot {
			return (
				node && typeof node === 'object' && typeof node.getIn === 'function'
			)
		},
		getValueFromRoot(
			keyPath: string | Scalar,
			{ keepScalar = false }: { keepScalar?: boolean } = {},
		): YAMLNode | undefined {
			keyPath = baseUtils.getPreparedKeyForDereference(
				baseUtils.getScalarValue(keyPath),
			) as string

			let [firstKey, ...rest] = keyPath.split('.')
			let result: any

			if (pages.has(firstKey)) {
				if (!rest.length) {
					result = pages.get(firstKey).doc.contents
				} else {
					result = pages.get(firstKey).getIn(rest, keepScalar)
				}
			} else {
				if (root.has(firstKey)) {
					const node = root.get(firstKey)
					if (rest.length) {
						if (o.canUseGetIn(node)) {
							result = node.getIn(rest, keepScalar)
						} else if (node instanceof YAMLSeq) {
							// TODO - Look into this part
							result = node.getIn(rest, keepScalar)
						}
					} else {
						result = node
					}
				}
			}

			return result
		},
	}

	return o
}

export default getVisitorUtils
