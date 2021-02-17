import { userEvent } from 'noodl-types'
import { Document } from 'yaml'
import { Pair, Scalar, YAMLMap, YAMLSeq } from 'yaml/types'
import NoodlVisitor from './NoodlVisitor'
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

	has(key: Parameters<Document['has']>[0]) {
		return this.doc.has(key)
	}

	hasIn(args: Parameters<Document['hasIn']>[0]) {
		return this.doc.hasIn(args)
	}

	get(key: Parameters<Document['get']>[0], keepScalar: boolean = false) {
		return this.doc.get(key, keepScalar)
	}

	getIn(args: Parameters<Document['getIn']>[0], keepScalar: boolean = false) {
		return this.doc.getIn(args, keepScalar)
	}

	getActions() {
		const actions = []
		NoodlVisitor.visit(this.doc, ({ node }, util) => {
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
		NoodlVisitor.visit(this.doc, ({ node }, util) => {
			if (node instanceof YAMLMap) {
				if (util.isBuiltInAction(node)) builtIns.push(node.toJSON())
			}
		})
		return builtIns
	}

	getComponents() {
		const components = []
		NoodlVisitor.visit(this.doc, ({ node }, util) => {
			if (node instanceof YAMLMap) {
				if (util.isComponentLike(node)) components.push(node.toJSON())
			}
		})
		return components
	}

	getReferences({ scalar = true }: { scalar?: boolean } = {}) {
		const references = []
		NoodlVisitor.visit(this.doc, ({ node }, util) => {
			if (node instanceof Scalar) {
				if (util.isReference(node)) references.push(scalar ? node : node.value)
			}
		})
		return references
	}
}

export default NoodlPage
