/**
 * All transformers in this file eventually become composed as a single
 * transformer passed to all visitors as a util function
 */
import flowRight from 'lodash/flowRight'
import { Node, Scalar, Pair, YAMLMap, YAMLSeq } from 'yaml/types'
import { InternalComposerBaseArgs } from '../types/internalTypes'
import yaml from 'yaml'
import NoodlPage from '../NoodlPage'
import * as baseUtils from '../utils'
import * as u from '../utils/internal'
import * as T from '../types'
import { partialRight } from 'lodash'

function getTransformer({ pages, root }: InternalComposerBaseArgs) {
	const _dereference = ({
		node,
		page,
		util,
	}: {
		node: Scalar
		page: NoodlPage
		util: T.NoodlVisitorUtils
	}) => {
		if (util.isLocalReference(node)) {
			if (util.isScalar(node)) {
				node.value = page.getIn(
					util.getPreparedKeyForDereference(node).split('.'),
					false,
				)
			}
		} else if (util.isRootReference(node)) {
			node.value = util.getValueFromRoot(node)
		} else if (util.isPopulateReference(node)) {
			//
		} else if (util.isTraverseReference(node)) {
			//
		}
	}

	return function transform(
		args: T.NoodlVisitorNodeArgs,
		util: T.NoodlVisitorUtils,
	) {
		const { page, key, node, path } = args
		const { isReference, isScalar } = util

		let result: any

		if (isScalar(node)) {
			if (isReference(node)) _dereference({ node, page, util })
			if (result instanceof Scalar && isReference(result)) {
				// return getReference.call(args, result)
			} else if (u.isStr(result) && isReference(new Scalar(result))) {
				// return getReference.call(args, result)
			}
		}
	}
}

export default getTransformer
