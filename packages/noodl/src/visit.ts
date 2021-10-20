import { Node, isNode } from 'yaml'
import yaml from 'yaml'
import Page from './Page'
import Root from './Root'
import * as T from './types'

class NoodlVisitor implements T.InternalComposerBaseArgs {
	pages: T.InternalComposerBaseArgs['pages']
	root: T.InternalComposerBaseArgs['root']

	constructor({ pages, root }: { pages: T.Pages; root: Root }) {
		this.pages = pages
		this.root = root
	}

	visit<N extends Page>(node: N, visitor: T.NoodlVisitor.Visit): N
	visit<N extends Node>(node: N, visitor: T.NoodlVisitor.Visit): N
	visit<N extends yaml.Document>(node: N, visitor: T.NoodlVisitor.Visit): N
	visit<N extends Page | Node | yaml.Document>(
		node: N,
		visitor: T.NoodlVisitor.Visit,
	): N {
		if (!node) {
			throw new Error('The visiting node is null or undefined')
		}
		if (node) {
			if (node instanceof Page) {
				yaml.visit(node.doc, this.#wrapVisitorFn(visitor))
			} else if (node instanceof yaml.Document) {
				yaml.visit(node, this.#wrapVisitorFn(visitor))
			} else if (isNode(node)) {
				yaml.visit(node, this.#wrapVisitorFn(visitor))
			}
		} else {
			// Visit root
			for (let n of Object.values(this.root)) {
				n = n instanceof Page ? n.doc : n
				if (n) {
					yaml.visit(n, this.#wrapVisitorFn(visitor))
				}
			}
		}
		return node
	}

	#wrapVisitorFn = (visitor: T.NoodlVisitor.Visit): yaml.visitor => {
		return (key, node, path) => {
			return visitor({
				pages: this.pages,
				root: this.root,
				key,
				node: node as Node,
				path: path as Node[],
			})
		}
	}
}

export default NoodlVisitor
