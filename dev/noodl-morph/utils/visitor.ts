/**
 * All utilities in this file eventually get composed to form a single utilies
 * object passed to all visitors
 */
import yaml from 'yaml'
import { Node, Scalar, Pair, YAMLMap, YAMLSeq } from 'yaml/types'
import NoodlPage from '../NoodlPage'
import * as util from '../utils'
import * as T from '../types/internalTypes'

function createVisitorUtils({
	local,
	pages,
	root,
}: T.InternalComposerBaseArgs) {
	const o = {
		getNodeAtLocalOrRoot(
			nodePath: string | Scalar,
		): Node | NoodlPage | yaml.Document.Parsed {
			nodePath = util.getPreparedKeyForDereference(
				util.getScalarValue(nodePath),
			) as string

			let [firstKey, ...rest] = nodePath.split('.')
			let result: any

			if (util.isLocalReference(nodePath)) {
				if (pages.has(firstKey)) result = pages.get(firstKey).getIn(rest)
			} else if (util.isRootReference(nodePath)) {
				result = root[firstKey]
				if (rest.length) {
					if (
						result instanceof NoodlPage ||
						result instanceof yaml.Document ||
						result instanceof YAMLMap
					) {
						result = result.getIn(rest)
					} else if (result instanceof YAMLSeq) {
						result = result.getIn(rest)
					}
				}
			} else if (util.isPopulateReference(nodePath)) {
				//
			} else if (util.isTraverseReference(nodePath)) {
			}

			return result
		},
	}

	return o
}

export default createVisitorUtils
