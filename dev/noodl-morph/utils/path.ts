/**
 * Helpers that wrap node paths in visitors
 */
import yaml from 'yaml'
import { Node, Scalar, Pair, YAMLMap, YAMLSeq } from 'yaml/types'
import { YAMLNode } from '../../../src/types'
import NoodlPage from '../NoodlPage'
import * as baseUtils from '../utils'
import * as T from '../types/internalTypes'

export function getPathUtils({ pages, root }: T.InternalComposerBaseArgs) {
	const o = {
		getPageWithPath(path: Node[]) {
			if (path[0]) {
				for (const page of pages.values()) {
					if (page.doc.contents === path[0]) return page
				}
			}
		},
	}

	return o
}

export default getPathUtils
