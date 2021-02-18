import yaml from 'yaml'
import { Node, Scalar } from 'yaml/types'
import { NoodlPage } from '../types'
import * as D from '../../../src/types'
import * as T from '../types'

export function createDocWithJsObject(obj: {
	[key: string]: any
}): yaml.Document.Parsed {
	return yaml.parseDocument(yaml.stringify(obj))
}

type Cb<N extends Node | D.YAMLNode = Node> = (node: N) => void

export function getDescendantNode(
	node: NoodlPage | D.YAMLNode,
	fn: (arg: T.OrigVisitorArgsAsObject) => boolean,
	opts?: { withVisitorArgs?: boolean },
): D.YAMLNode | null
export function getDescendantNode(
	node: NoodlPage | D.YAMLNode,
	opts: {
		scalar: (arg: T.OrigVisitorArgsAsObject<Scalar>) => boolean
		withVisitorArgs?: boolean
	},
): D.YAMLNode | null
export function getDescendantNode(
	node: NoodlPage | D.YAMLNode,
	opts:
		| ((arg: T.OrigVisitorArgsAsObject) => boolean)
		| {
				scalar: (arg: T.OrigVisitorArgsAsObject<Scalar>) => boolean
				withVisitorArgs?: boolean
		  },
	opts2?: { withVisitorArgs?: boolean },
): D.YAMLNode | null {
	let value: D.YAMLNode | null = null

	yaml.visit(node instanceof NoodlPage ? node.doc : node, (key, node, path) => {
		if (typeof opts === 'function') {
			if (opts({ key, node, path })) {
				value = node
				return yaml.visit.BREAK
			}
		} else if (opts && typeof opts === 'object') {
			if ('scalar' in opts) {
				if (node instanceof Scalar && opts.scalar({ key, node, path })) {
					value = node
					return yaml.visit.BREAK
				}
			}
		}
	})

	return value
}
