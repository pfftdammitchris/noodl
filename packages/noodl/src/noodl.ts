import { isMap, isSeq, isPair, Node, Pair } from 'yaml'
import yaml from 'yaml'
import Page from './Page'
import Root from './Root'
import { getScalarValue } from './utils/index'
import * as T from './types'

class Noodl implements T.InternalComposerBaseArgs {
	#pages: T.InternalComposerBaseArgs['pages']
	#root: T.InternalComposerBaseArgs['root']

	constructor({
		root = new Root({} as any),
		pages = new Map(),
	}: { root?: Root; pages?: T.Pages } = {}) {
		this.#root = root
		this.#pages = pages
	}

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
		let page = this.#pages.get(name)

		if (u.isPage(page)) return page
		else page = new Page(name, doc)

		this.#pages.set(name, page)

		this.root.set({
			enumerable: !spread,
			key: name,
			get: () => this.#pages.get(name),
			set: (v) => {
				if (!(v instanceof Page)) {
					const errMsg =
						`Cannot set the value for page "${name}" because the ` +
						`value provided is not a page`
					throw new Error(errMsg)
				}
				this.#pages.set(name, v)
			},
		})

		if (spread) {
			// REMINDER: Only YAMLMap nodes are spreaded to root
			const page = this.#pages?.get?.(name)

			if (isMap(page?.doc.contents)) {
				page?.doc?.contents?.items?.forEach?.((node: Node) => {
					if (isMap(node)) {
						node.items?.forEach((pair) => {
							const rootKey = getScalarValue(pair.key)
							this.root.set({
								key: rootKey,
								get: () => pair.value,
								set: (v) => (this.root[rootKey] = v),
							})
						})
					} else if (isPair(node)) {
						const rootKey = getScalarValue(node.key)
						this.root.set({
							key: rootKey,
							get: () => node.value,
							set: (v) => (this.root[rootKey] = v),
						})
					}
				})
			}
		}

		return this.#pages.get(name)
	}

	clear() {
		this.#pages.clear()
		this.root.clear()
	}
}

export default Noodl
