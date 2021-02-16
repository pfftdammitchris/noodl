// Internal visitors that transform nodes complying to the NOODL spec
import yaml from 'yaml'
import { Node, Scalar, Pair, YAMLMap, YAMLSeq } from 'yaml/types'
import { NoodlVisitorArgs, OrigVisitorReturnType } from '../NoodlMorph'

const internalVisitors: {
	[key: string]: (...args: NoodlVisitorArgs) => OrigVisitorReturnType
} = {
	transformReferences({ root, doc, key, node, path }, util) {
		if (util.isScalar(node)) {
			if (util.isReference(node)) {
				if (util.isLocalReference(node)) {
					const path = util.getPreparedKeyForDereference(node)
					node.value = doc.getIn(path)
				} else if (util.isRootReference(node)) {
					//
				}
			}
		}
	},
}

export default internalVisitors
