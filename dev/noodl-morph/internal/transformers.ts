/**
 * All transformers in this file eventually become composed as a single
 * transformer passed to all visitors as a util function
 */
import { Node, Scalar, Pair, YAMLMap, YAMLSeq } from 'yaml/types'
import { InternalComposerBaseArgs } from '../types/internalTypes'
import yaml from 'yaml'
import NoodlPage from '../NoodlPage'
import * as baseUtils from '../utils'
import * as u from '../utils/internal'
import * as T from '../types'

function getTransformer({ pages, root }: InternalComposerBaseArgs) {
	const o: { [name: string]: T.NoodlVisitorFn } = {}

	return function transform(
		{ page, key, node, path }: T.NoodlVisitorNodeArgs,
		util: T.NoodlVisitorUtils,
	) {
		let result: any

		if (util.isScalar(node)) {
			if (util.isReference(node)) {
				if (util.isLocalReference(node)) {
					node.value = page.getIn(
						util.getPreparedKeyForDereference(node).split('.'),
						false,
					)
				} else if (util.isRootReference(node)) {
					node.value = util.getValueFromRoot(node)
				} else if (util.isPopulateReference(node)) {
					//
				} else if (util.isTraverseReference(node)) {
					//
				}
			}

			if (result instanceof Scalar && util.isReference(result)) {
				// return getReference.call(args, result)
			} else if (u.isStr(result) && util.isReference(new Scalar(result))) {
				// return getReference.call(args, result)
			}
		}
	}
}

export default getTransformer
