import yaml, { Document } from 'yaml'
import { Node } from 'yaml'
import { YAMLNode } from './types'
import * as u from './utils/internal'

export interface NoodlPageOptions {
	name?: string
	doc?: Document | Document.Parsed
}

class NoodlPage {
	#name: string = ''
	doc: Document | Document.Parsed

	constructor(name: string | Document | NoodlPageOptions, doc?: Document) {
		if (u.isStr(name) && doc instanceof Document) {
			//
		} else if (name instanceof Document) {
			doc = name
		} else if (u.isObj(name)) {
			doc = name.doc
			name = name.name || ''
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

	contains(node: Node) {
		let result: boolean | undefined

		if (u.isNode(node)) {
			const key = (u.isScalar(node)
				? 'Scalar'
				: u.isPair(node)
				? 'Pair'
				: u.isMap(node)
				? 'Map'
				: u.isSeq(node)
				? 'Seq'
				: undefined) as 'Scalar' | 'Pair' | 'Map' | 'Seq'

			if (key) {
				yaml.visit(this.doc, {
					[key](_: any, n: any) {
						if (n === node) {
							result = true
							return yaml.visit.BREAK
						}
					},
				})
			}
		}

		return !!result
	}

	find(fn: (node: YAMLNode) => boolean) {
		let result: YAMLNode | null = null

		yaml.visit(this.doc, (key, node, path) => {
			if (fn(node)) {
				result = node
				return yaml.visit.BREAK
			}
		})

		return result
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
}

export default NoodlPage
