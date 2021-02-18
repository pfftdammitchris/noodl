import { Node, Scalar, Pair, YAMLMap, YAMLSeq } from 'yaml/types'
import yaml from 'yaml'
import NoodlPage from './NoodlPage'
import NoodlRoot from './NoodlRoot'
import getInternalTransformers from './internal/transformers'
import getVisitorUtils from './internal/getVisitorUtils'
import { YAMLNode } from '../../src/types'
import * as baseUtils from './utils'
import * as u from './utils/internal'
import * as com from '../../src/utils/common'
import * as T from './types'

const NoodlMorph = (function () {
	const pages = new Map<string, NoodlPage>()
	const root = new NoodlRoot()
	const visitorUtils = {
		...baseUtils,
		...getVisitorUtils({ pages, root }),
		transform: getInternalTransformers({ pages, root }),
	} as T.NoodlVisitorUtils

	function _visitRoot(visitor: T.NoodlVisitorFn) {
		for (const rootNode of Object.values(root)) {
			let page: NoodlPage
			let visitorNode =
				rootNode instanceof NoodlPage
					? rootNode.doc
					: rootNode instanceof Node
					? rootNode
					: undefined

			if (rootNode instanceof NoodlPage) {
				page = rootNode
			} else {
				// TODO - Find the NoodlPage
			}

			if (visitorNode) {
				yaml.visit(visitorNode, (key, node, path) => {
					visitor({ page, pages, root, key, node, path }, visitorUtils)
				})
			}
		}
	}

	const o = {
		get pages() {
			return pages
		},
		get root() {
			return root
		},
		createPage({
			name,
			doc,
			spread = false,
		}: {
			name: string
			doc: yaml.Document
			spread?: boolean
		}) {
			if (name && pages.has(name)) return pages.get(name)

			pages.set(name, new NoodlPage(name, doc))

			root.set({
				enumerable: !spread,
				key: name,
				get: () => pages.get(name),
				set: (v) => {
					if (!(v instanceof NoodlPage)) {
						const errMsg =
							`Cannot set the value for page "${name}" because the ` +
							`value is not a page`
						throw new Error(errMsg)
					}
					pages.set(name, v)
				},
			})

			if (spread) {
				// REMINDER: Only YAMLMap nodes are spreaded to root
				pages.get(name).doc.contents.items?.forEach?.((node) => {
					if (node instanceof YAMLMap) {
						node.items?.forEach((pair) => {
							const rootKey = baseUtils.getScalarValue(pair.key)
							root.set({
								key: rootKey,
								get: () => pair.value,
								set: (v) => (root[rootKey] = v),
							})
						})
					} else if (node instanceof Pair) {
						const rootKey = baseUtils.getScalarValue(node.key)
						root.set({
							key: rootKey,
							get: () => node.value,
							set: (v) => (root[rootKey] = v),
						})
					}
				})
			}

			return pages.get(name)
		},
		/**
		 * @NOTE --> Use only NoodlPage or no args (root) for now.
		 * TODO --> Figure out how to find a node's NoodlPage when
		 */
		visit<
			N extends
				| NoodlPage
				| YAMLNode
				| yaml.Document.Parsed
				| T.NoodlVisitorFn
				| T.NoodlRoot
		>(node: N, visitor: T.NoodlVisitorFn): N {
			if (!node && !(node instanceof NoodlPage) && !(node instanceof Node)) {
				throw new Error('The visiting node is null or undefined')
			}

			const visit = (page?: NoodlPage) => (
				key: T.OrigVisitorArgs[0],
				node: T.OrigVisitorArgs[1],
				path: T.OrigVisitorArgs[2],
			) => {
				if (!page) page = visitorUtils.findPage(node)
				if (!page) {
					if (!u.isNode(node)) {
						throw new Error(`Expected a YAML node but received: ${typeof node}`)
					}
					throw new Error(
						`A visiting node should be a descendant of a NoodlPage. The node's value is: ${com.white(
							!(node instanceof Node) ? JSON.stringify(node) : node,
						)}`,
					)
				}
				visitor(
					{ page, pages, root, key, node: node as YAMLNode, path },
					visitorUtils,
				)
			}

			if (node) {
				if (node instanceof NoodlPage) {
					yaml.visit(node.doc.contents, visit(node))
				} else if (node instanceof yaml.Document) {
					yaml.visit(node.contents, visit())
				} else if (node instanceof Node) {
					yaml.visit(node, visit())
				} else if (u.isFnc(node)) {
					_visitRoot(visitor)
				}
			} else {
				_visitRoot(visitor)
			}

			return node
		},
		util: visitorUtils,
	}

	return o
})()

export default NoodlMorph
