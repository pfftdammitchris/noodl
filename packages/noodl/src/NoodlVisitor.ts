import { Node, Pair, YAMLMap } from 'yaml/types'
import yaml from 'yaml'
import NoodlPage from './NoodlPage'
import NoodlRoot from './NoodlRoot'
import getTransformer from './internal/transformers'
import getVisitorUtils from './internal/getVisitorUtils'
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
			this.pages.get(name)?.doc.contents.items?.forEach?.((node: Node) => {
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

	/**
	 * @NOTE --> Use only NoodlPage or no args (root) for now.
	 * TODO --> Figure out how to find a node's NoodlPage when
	 */
	visit<N extends NoodlPage>(node: N, visitor: T.NoodlVisitorFn): N
	visit<N extends Node>(node: N, visitor: T.NoodlVisitorFn): N
	visit<N extends T.NoodlVisitorFn>(node: N, visitor: T.NoodlVisitorFn): N
	visit<N extends yaml.Document.Parsed>(node: N, visitor: T.NoodlVisitorFn): N
	visit<N extends NoodlPage | Node | T.NoodlVisitorFn | yaml.Document.Parsed>(
		node: N,
		visitor: T.NoodlVisitorFn,
	): N {
		if (!node) {
			throw new Error('The visiting node is null or undefined')
		}
		if (node) {
			if (node instanceof NoodlPage) {
				yaml.visit(node.doc.contents, this.#wrapVisitorFn(visitor))
			} else if (node instanceof yaml.Document) {
				yaml.visit(node.contents, this.#wrapVisitorFn(visitor))
			} else if (node instanceof Node) {
				yaml.visit(node, this.#wrapVisitorFn(visitor))
			} else if (u.isFnc(node)) {
				this.#visitRoot(visitor)
			}
		} else {
			this.#visitRoot(visitor)
		}
		return node
	}

	#wrapVisitorFn = (fn: T.NoodlVisitorFn): yaml.visitor<any> => {
		return (key, node, path) => {
			const result = fn(
				{ pages: this.pages, root: this.root, key, node, path },
				this.utils(),
			)
			if (result) return result
		}
	}

	#visitRoot = (visitor: T.NoodlVisitorFn) => {
		for (let node of Object.values(this.root)) {
			node = node instanceof NoodlPage ? node.doc : node
			if (node) {
				yaml.visit(node, this.#wrapVisitorFn(visitor))
			}
		}
	}

	utils() {
		return {
			...baseUtils,
			...getVisitorUtils({ pages: this.pages, root: this.root }),
			transform: getTransformer({ pages: this.pages, root: this.root }),
		} as T.NoodlVisitorUtils
	}
}

export default NoodlVisitor
