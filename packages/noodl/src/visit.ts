import { Node, Scalar, Pair, YAMLMap, YAMLSeq } from 'yaml/types'
import yaml from 'yaml'
import NoodlPage from './NoodlPage'
import NoodlRoot from './NoodlRoot'
import getTransformer from './internal/transformers'
import getVisitorUtils from './internal/getVisitorUtils'
import * as com from 'noodl-common'
import * as baseUtils from './utils'
import * as u from './utils/internal'
import * as T from './types'

class NoodlVisitor {
	#pages = new Map<string, NoodlPage>()
	#root = new NoodlRoot()

	get pages() {
		return this.#pages
	}

	get root() {
		return this.#root
	}

	createPage({
		name,
		doc,
		spread = false,
	}: {
		name: string
		doc: yaml.Document
		spread?: boolean
	}) {
		if (name && this.pages.has(name)) return this.pages.get(name)

		this.pages.set(name, new NoodlPage(name, doc))

		this.root.set({
			enumerable: !spread,
			key: name,
			get: () => this.pages.get(name),
			set: (v) => {
				if (!(v instanceof NoodlPage)) {
					const errMsg =
						`Cannot set the value for page "${name}" because the ` +
						`value is not a page`
					throw new Error(errMsg)
				}
				this.pages.set(name, v)
			},
		})

		if (spread) {
			// REMINDER: Only YAMLMap nodes are spreaded to root
			this.pages
				.get(name)
				?.doc.contents.items?.forEach?.((node: T.YAMLNode) => {
					if (node instanceof YAMLMap) {
						node.items?.forEach((pair) => {
							const rootKey = baseUtils.getScalarValue(pair.key)
							this.root.set({
								key: rootKey,
								get: () => pair.value,
								set: (v) => (this.root[rootKey] = v),
							})
						})
					} else if (node instanceof Pair) {
						const rootKey = baseUtils.getScalarValue(node.key)
						this.root.set({
							key: rootKey,
							get: () => node.value,
							set: (v) => (this.root[rootKey] = v),
						})
					}
				})
		}

		return this.pages.get(name)
	}

	getUtils() {
		return {
			...baseUtils,
			...getVisitorUtils({ pages: this.pages, root: this.root }),
			transform: getTransformer({ pages: this.pages, root: this.root }),
		} as T.NoodlVisitorUtils
	}

	visitRoot(visitor: T.NoodlVisitorFn) {
		for (const rootNode of Object.values(this.root)) {
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
					visitor(
						{ page, pages: this.pages, root: this.root, key, node, path },
						this.getUtils(),
					)
				})
			}
		}
	}

	/**
	 * @NOTE --> Use only NoodlPage or no args (root) for now.
	 * TODO --> Figure out how to find a node's NoodlPage when
	 */
	visit<
		N extends
			| NoodlPage
			| T.YAMLNode
			| yaml.Document.Parsed
			| T.NoodlVisitorFn
			| T.NoodlRoot
	>(node: N, visitor: T.NoodlVisitorFn): N {
		if (
			!node &&
			!((node as T.YAMLNode) instanceof NoodlPage) &&
			!((node as T.YAMLNode) instanceof Node)
		) {
			throw new Error('The visiting node is null or undefined')
		}

		const visit = (page?: NoodlPage) => (
			key: T.OrigVisitorArgs[0],
			node: T.OrigVisitorArgs[1],
			path: T.OrigVisitorArgs[2],
		) => {
			if (!page) page = this.getUtils().findPage(node) as NoodlPage
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
			return visitor(
				{
					page,
					pages: this.pages,
					root: this.root,
					key,
					node: node as T.YAMLNode,
					path,
				},
				this.getUtils(),
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
				this.visitRoot(visitor)
			}
		} else {
			this.visitRoot(visitor)
		}

		return node
	}
}

export default NoodlVisitor
