import { Node, Scalar, Pair, YAMLMap, YAMLSeq } from 'yaml/types'
import yaml from 'yaml'
import NoodlPage from './NoodlPage'
import getInternalTransformers from './internal/transformers'
import * as baseUtils from './utils'
import * as u from './utils/internal'
import * as T from './types'
import { YAMLNode } from '../../src/types'

const NoodlMorph = (function () {
	const pages = new Map<string, NoodlPage>()
	const root: T.Root = {}
	const local = { page: '' }
	const visitorUtils: T.NoodlVisitorUtils = {
		...baseUtils,
		local,
		transform: getInternalTransformers({
			pages,
			root,
		}),
	}

	function enhanceOriginalVisitor({
		root: rootProp,
		doc,
		visitor,
	}: {
		root: T.Root
		doc: yaml.Document
		visitor: (
			args: T.NoodlVisitorNodeArgs,
			utils: T.NoodlVisitorUtils,
		) => ReturnType<yaml.visit>
	}) {
		return (...[key, node, path]: T.OrigVisitorArgs) => {
			return visitor(
				{ pages, root: rootProp, doc, key, node, path },
				visitorUtils,
			)
		}
	}

	function visit(node: YAMLNode): T.OrigVisitorReturnType
	function visit(page: NoodlPage): T.OrigVisitorReturnType
	function visit(doc: yaml.Document.Parsed): T.OrigVisitorReturnType
	function visit(root: T.Root): T.OrigVisitorReturnType
	function visit(arg: never): T.OrigVisitorReturnType
	function visit(
		page:
			| never
			| NoodlPage
			| YAMLNode
			| yaml.Document.Parsed
			| T.NoodlVisitorFn
			| T.Root,
		visitor?: T.NoodlVisitorFn,
	) {
		if (page) {
			if (page instanceof NoodlPage) {
				yaml.visit(page.doc, enhanceOriginalVisitor({ root, page, visitor }))
			} else if (page instanceof yaml.Document) {
				// TODO : get doc
				yaml.visit(page, enhanceOriginalVisitor({ root, page, visitor }))
			} else if (page === root) {
				//
			} else if (u.isFnc(page)) {
				//
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
		set root(value) {
			for (const val of Object.keys(root)) {
				delete root[val]
			}
			Object.assign(root, value)
		},
		clearRoot(init?: Partial<T.Root>) {
			o.root = init as typeof root
			return o
		},
		insertToRoot({
			key,
			value,
			spread,
		}: {
			key: string
			value: Node | yaml.Document.Parsed | { [key: string]: any }
			spread?: boolean
		}) {
			if (spread) {
				try {
					Object.entries(visitorUtils.flattenMap(value as YAMLMap)).forEach(
						([k, v]) => {
							root[k] = v
						},
					)
				} catch (error) {
					console.error(`[${error.name} | Spread Error]: ${error.message}`)
				}
			} else {
				root[key] = value
			}
			return this
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

			Object.defineProperty(root, name, {
				enumerable: true,
				configurable: true,
				get() {
					return pages.get(name)
				},
				set(value) {
					if (!(value instanceof NoodlPage)) {
						throw new Error(
							`Cannot set the value for page "${name}" because the value is not a page`,
						)
					}
					pages.set(name, value)
				},
			})

			if (spread) {
				// REMINDER: Only YAMLMap nodes are spreaded to root
				page.doc.contents.items?.forEach?.((node) => {
					if (node instanceof YAMLMap) {
						node.items?.forEach((pair) => {
							const rootKey = baseUtils.getScalarValue(pair.key)
							Object.defineProperty(root, rootKey, {
								configurable: true,
								enumerable: true,
								get() {
									return pair.value
								},
								set(value) {
									root[rootKey] = value
								},
							})
						})
					}
				})
			}

			return page
		},
		visit(
			this: typeof T.visit,
			page: NoodlPage | T.NoodlVisitorFn,
			visitor?: T.NoodlVisitorFn,
		) {
			if (page) {
				if (page instanceof NoodlPage) {
					yaml.visit(page.doc, enhanceOriginalVisitor({ root, page, visitor }))
				} else if (page instanceof yaml.Document) {
					// TODO : get doc
					yaml.visit(page, enhanceOriginalVisitor({ root, page, visitor }))
				} else if (page === root) {
					//
				} else if (u.isFnc(page)) {
					//
				}
			}
		},
	}

	return o
})()

export default NoodlMorph
