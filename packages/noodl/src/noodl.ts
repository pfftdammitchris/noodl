import { Node, Pair, YAMLMap } from 'yaml/types'
import yaml from 'yaml'
import Page from './Page'
import Root from './Root'
import Utils from './Utils'
import { getScalarValue } from './utils/index'
import * as u from './utils/internal'
import * as T from './types'

class Noodl implements T.InternalComposerBaseArgs {
	#pages: T.InternalComposerBaseArgs['pages']
	#root: T.InternalComposerBaseArgs['root']
	#util: Utils

	constructor({
		root = new Root(),
		pages = new Map(),
		util = new Utils({ pages, root }),
	}: { root?: Root; pages?: T.Pages; util?: Utils } = {}) {
		this.#root = root
		this.#pages = pages
		this.#util = util
	}

	get pages() {
		return this.#pages
	}

	get root() {
		return this.#root
	}

	get util() {
		return this.#util
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
		let page = this.pages.get(name)

		if (u.isPage(page)) return page
		else page = new Page(name, doc)

		this.pages.set(name, page)

		this.root.set({
			enumerable: !spread,
			key: name,
			get: () => this.pages.get(name),
			set: (v) => {
				if (!(v instanceof Page)) {
					const errMsg =
						`Cannot set the value for page "${name}" because the ` +
						`value provided is not a page`
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
						const rootKey = getScalarValue(pair.key)
						this.root.set({
							key: rootKey,
							get: () => pair.value,
							set: (v) => (this.root[rootKey] = v),
						})
					})
				} else if (node instanceof Pair) {
					const rootKey = getScalarValue(node.key)
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

	clear() {
		this.pages.clear()
		this.root.clear()
	}
}

export default Noodl
