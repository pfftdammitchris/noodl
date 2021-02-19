/**
 * All transformers in this file eventually become composed as a single
 * transformer passed to all visitors as a util function
 */
import flowRight from 'lodash/flowRight'
import { Node, Scalar, Pair, YAMLMap, YAMLSeq } from 'yaml/types'
import { InternalComposerBaseArgs } from '../types/internalTypes'
import yaml from 'yaml'
import NoodlPage from '../NoodlPage'
import {
	getPreparedKeyForDereference,
	isScalar,
	isPair,
	isMap,
	isSeq,
	isReference,
	isLocalReference,
	isRootReference,
	isApplyReference,
	isTraverseReference,
} from '../utils'
import getVisitorUtils from '../internal/getVisitorUtils'
import * as u from '../utils/internal'
import * as T from '../types'

function getTransformer({ pages, root }: InternalComposerBaseArgs) {
	class Transform {
		args: T.NoodlVisitorNodeArgs

		static localReference({ node, page }: { node: Scalar; page: NoodlPage }) {
			node.value = page.getIn(
				getPreparedKeyForDereference(node).split('.'),
				false,
			)
			return node
		}

		static rootReference({ node }) {
			getVisitorUtils({ pages, root }).getValueFromRoot(node)
		}

		transform(args: T.NoodlVisitorNodeArgs, util: T.NoodlVisitorUtils) {
			const { page, key, node, path } = args
			const { isReference, isScalar } = util

			if (isScalar(node)) {
				if (isReference(node)) {
					if (isLocalReference(node)) {
						Transform.localReference({ node, page })
					} else if (isRootReference(node)) {
						Transform.rootReference({ node })
					} else if (isApplyReference(node)) {
						// The value (or incoming value) at the right side of the key/value pair
						// is also applied to the referenced value before the @ symbol
					} else if (isTraverseReference(node)) {
						//
					}
				}
			}
		}
	}

	return Transform
}

export default getTransformer
