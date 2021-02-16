/**
 * All transformers in this file eventually become composed as a single
 * transformer passed to all visitors as a util function
 */
import { Node, Scalar, Pair, YAMLMap, YAMLSeq } from 'yaml/types'
import { InternalComposerBaseArgs } from '../types/internalTypes'
import yaml from 'yaml'
import NoodlPage from '../NoodlPage'
import * as util from '../utils'
import * as T from '../types'

function getTransformer({ pages, root }: InternalComposerBaseArgs) {
	const o: { [name: string]: T.NoodlVisitorFn } = {
		reference({ pages, root, doc, node, key, path }) {
			//
		},
	}

	function transform<N extends Scalar | Pair | YAMLMap | YAMLSeq>(node: N): N {
		return node
	}

	return transform as T.NoodlVisitorUtils['transform']
}

export default getTransformer
