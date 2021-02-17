/**
 * All utilities in this file eventually get composed to form a single utilies
 * object passed to all visitors
 */
import yaml from 'yaml'
import { Node, Scalar, Pair, YAMLMap, YAMLSeq } from 'yaml/types'
import { YAMLNode } from '../../../src/types'
import NoodlPage from '../NoodlPage'
import * as baseUtils from '../utils'
import * as T from '../types/internalTypes'

function getVisitorUtils({ pages, root }: T.InternalComposerBaseArgs) {
	const o = {
		getValueFromRoot(keyPath: string | Scalar): YAMLNode | undefined {
			keyPath = baseUtils.getPreparedKeyForDereference(
				baseUtils.getScalarValue(keyPath),
			) as string

			let [firstKey, ...rest] = keyPath.split('.')
			let result: any

			if (pages.has(firstKey)) {
				if (!rest.length) {
					result = pages.get(firstKey).doc.contents
				} else {
					result = pages.get(firstKey).getIn(rest)
				}
			} else {
				if (root[firstKey]) {
					if (rest.length) {
						if (
							root[firstKey] instanceof NoodlPage ||
							root[firstKey] instanceof yaml.Document ||
							root[firstKey] instanceof YAMLMap
						) {
							result = root[firstKey].getIn(rest, true)
						} else if (root[firstKey] instanceof YAMLSeq) {
							// TODO - Look into this part
							result = root[firstKey].getIn(rest, true)
						}
					} else {
						result = root[firstKey]
					}
				}
			}

			return result
		},
	}

	return o
}

export default getVisitorUtils
