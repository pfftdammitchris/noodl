import { userEvent } from 'noodl-types'
import { Document } from 'yaml'
import { Pair, Scalar, YAMLMap, YAMLSeq } from 'yaml/types'
import NoodlVisitor from './NoodlVisitor'
import * as docHelpers from '../../src/utils/doc'
import * as d from './utils/doc'
import * as u from './utils/internal'

export interface NoodlPageOptions {
	name?: string
	doc?: Document
}

class NoodlPage {
	#name: string
	doc: Document

	constructor(name: string | Document | NoodlPageOptions, doc?: Document) {
		if (u.isStr(name) && doc instanceof Document) {
			//
		} else if (name instanceof Document) {
			doc = name
		} else if (u.isObj(name)) {
			doc = name.doc
			name = name.name
		}
		this.doc = doc || new Document()
		name && (this.name = name as string)
	}

	get name() {
		return this.#name
	}

	set name(name: string) {
		if (this.doc.has(name)) this.doc.contents = this.doc.get(name)
		this.#name = name
	}

	transform() {
		return this.doc
	}

	get(key: Parameters<Document['get']>[0]) {
		return this.doc.get(key, true)
	}

	getIn(args: Parameters<Document['getIn']>[0]) {
		return this.doc.getIn(args, true)
	}

	getActions(opts?: { actionType?: string }): any[]
	getActions(actionType?: string): any[]
	getActions(opts?: never): any[]
	getActions(opts?: unknown) {
		const actions = []
		const fns = []

		if (u.isObj(opts)) {
			//
		} else if (u.isStr(opts)) {
			//
		}

		const composedFns = docHelpers.composeMapFns(...fns)

		NoodlVisitor.visit(this.doc, ({ key, node, path }, util) => {
			if (node instanceof YAMLMap) {
				if (util.isActionLike(node)) {
					actions.push(node.toJSON())
				}
			}
		})

		return actions
	}

	getActionChains() {
		const actionChains = []
		NoodlVisitor.visit(this.doc, ({ key, node, path }, util) => {
			if (node instanceof YAMLSeq) {
				if (util.isActionChain(node)) {
					const nodeBefore = path[path.length - 1]
					if (nodeBefore instanceof Pair) {
						if (typeof nodeBefore.key.value === 'string') {
							if (userEvent.includes(nodeBefore.key.value)) {
								actionChains.push(node.toJSON())
							}
						}
					}
				}
			}
		})
		return actionChains
	}

	getBuiltIns() {
		const builtIns = []
		NoodlVisitor.visit(this.doc, ({ key, node, path }, util) => {
			if (node instanceof YAMLMap) {
				if (util.isBuiltInAction(node)) {
					builtIns.push(node.toJSON())
				}
			}
		})
		return builtIns
	}

	getComponents() {
		const components = []
		NoodlVisitor.visit(this.doc, ({ key, node, path }, util) => {
			if (node instanceof YAMLMap) {
				if (util.isComponentLike(node)) {
					components.push(node.toJSON())
				}
			}
		})
		return components
	}

	getReferences({ scalar = true }: { scalar?: boolean } = {}) {
		const references = []
		NoodlVisitor.visit(this.doc, ({ key, node, path }, util) => {
			if (node instanceof Scalar) {
				if (util.isReference(node)) {
					references.push(scalar ? node : node.value)
				}
			}
		})
		return references
	}
}

export default NoodlPage
