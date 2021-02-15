import { Node, Scalar, Pair, YAMLMap, YAMLSeq } from 'yaml/types'
import yaml from 'yaml'
import BuiltInCache from './cache/BuiltInCache'
import NoodlPage from './NoodlPage'
import { isScalar, isPair, isYAMLMap, isYAMLSeq } from '../../src/utils/doc'
import * as docUtil from './utils/doc'
import * as scalarUtil from './utils/scalar'
import * as seqUtil from './utils/seq'
import * as mapUtil from './utils/map'
import * as u from './utils/internal'

export type Root = { Global: yaml.Document; builtIn: BuiltInCache } & {
	[key: string]: any
}

export type OrigVisitorArgs = [
	key: number | 'key' | 'value',
	node: Node,
	path: Node[],
]

export interface OrigVisitorArgsAsObject {
	key: OrigVisitorArgs[0]
	node: OrigVisitorArgs[1]
	path: OrigVisitorArgs[2]
}

export type OrigVisitorReturnType = number | symbol | void | Node

export interface NoodlVisitorFn {
	(
		args: OrigVisitorArgsAsObject & { root: Root; doc: yaml.Document },
		util: NoodlVisitorUtilsArg,
	): OrigVisitorReturnType
}

export type NoodlVisitorUtilsArg = typeof docUtil &
	typeof scalarUtil &
	typeof mapUtil &
	typeof seqUtil & {
		isScalar: typeof isScalar
		isPair: typeof isPair
		isMap: typeof isYAMLMap
		isSeq: typeof isYAMLSeq
	}

const NoodlMorph = (function () {
	let pages = new Map<string, NoodlPage>()
	let root: Root = {
		Global: new yaml.Document(),
		builtIn: new BuiltInCache(),
	}

	let util: NoodlVisitorUtilsArg = {
		isScalar,
		isPair,
		isMap: isYAMLMap,
		isSeq: isYAMLSeq,
		...docUtil,
		...scalarUtil,
		...mapUtil,
		...seqUtil,
	}

	function enhanceOriginalVisitor({
		root: rootProp,
		doc,
		visitor,
	}: {
		root: Root
		doc: yaml.Document
		visitor: (
			args: Parameters<NoodlVisitorFn>[0],
			utils: Parameters<NoodlVisitorFn>[1],
		) => ReturnType<yaml.visit>
	}) {
		return (...[key, node, path]: OrigVisitorArgs) => {
			return visitor({ root: rootProp, doc, key, node, path }, util)
		}
	}

	function _visit(doc: yaml.Document, visitor: NoodlVisitorFn) {
		yaml.visit(doc, enhanceOriginalVisitor({ root, doc, visitor }))
	}

	const o = {
		get root() {
			return root
		},
		set root(value) {
			root = {
				Global: new yaml.Document(),
				builtIn: new BuiltInCache(),
				...value,
			}
		},
		createPage({ name, doc }: { name: string; doc: yaml.Document }) {
			if (name && pages.has(name)) return pages.get(name)
			const page = new NoodlPage(name, doc)
			pages.set(name, page)

			Object.defineProperty(root, name, {
				enumerable: true,
				get() {
					return pages.get(name)
				},
				set(value) {
					pages.set(name, value)
				},
			})

			return page
		},
		visit(
			doc: typeof root | yaml.Document | NoodlPage | NoodlVisitorFn,
			visitor?: NoodlVisitorFn,
		) {
			if (doc === root || doc instanceof yaml.Document) {
				//
			} else if (doc instanceof NoodlPage) {
				doc = doc.doc
			} else if (u.isFnc(doc)) {
				visitor = doc as NoodlVisitorFn
				doc = root
			}

			Object.entries(doc).forEach(([key, value]) => {
				if (pages.has(key)) {
					_visit(pages.get(key).doc, visitor)
				} else if (key === 'Global') {
					_visit(root.Global, visitor)
				} else {
					//
				}
			})
		},
	}

	return o
})()

export default NoodlMorph
