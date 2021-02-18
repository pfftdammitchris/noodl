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
		} else if (util.isApplyReference(node)) {
			// The value (or incoming value) at the right side of the key/value pair
			// is also applied to the referenced value before the @ symbol
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

		if (isScalar(node)) {
			if (isReference(node)) {
				_dereference({ node, page, util })
			}
		}
	}
}

export default getTransformer
