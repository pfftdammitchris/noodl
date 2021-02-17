import { Node, Scalar, Pair, YAMLMap, YAMLSeq } from 'yaml/types'
import yaml from 'yaml'
import NoodlPage from './NoodlPage'
import NoodlRoot from './NoodlRoot'
import getInternalTransformers from './internal/transformers'
import getPathUtils from './utils/path'
import getVisitorUtils from './utils/visitor'
import { YAMLNode } from '../../src/types'
import { NoodlVisitorFn } from './NoodlVisitor'
import * as baseUtils from './utils'
import * as u from './utils/internal'
import * as T from './types'

const NoodlMorph = (function () {
	const pages = new Map<string, NoodlPage>()
	const root = new NoodlRoot()
	const visitorUtils = {
		...baseUtils,
		...getPathUtils({ pages, root }),
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

			const page = new NoodlPage(name, doc)
			pages.set(name, page)

			root.set({
				enumerable: !spread,
				key: name,
				get: () => page,
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
				page.doc.contents.items?.forEach?.((node) => {
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

			return page
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
				| NoodlVisitorFn
				| T.NoodlRoot
		>(node: N, visitor: T.NoodlVisitorFn): N {
			const visit = (page?: NoodlPage) => (
				key: T.OrigVisitorArgs[0],
				node: T.OrigVisitorArgs[1],
				path: T.OrigVisitorArgs[2],
			) => {
				if (!page) page = visitorUtils.getPageWithPath(path)
				if (!page) throw new Error('No page was found for this node')
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
	}

	return o
})()

export default NoodlMorph
