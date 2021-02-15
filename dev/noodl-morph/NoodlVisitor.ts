import yaml from 'yaml'
import { Node } from 'yaml/types'
import { isScalar, isPair, isYAMLMap, isYAMLSeq } from '../../src/utils/doc'
import * as docUtil from './utils/doc'
import * as scalarUtil from './utils/scalar'
import * as seqUtil from './utils/seq'
import * as mapUtil from './utils/map'

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
		args: OrigVisitorArgsAsObject & { doc: yaml.Document },
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

const NoodlVisitor = (function () {
	const util: NoodlVisitorUtilsArg = {
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
		doc,
		visitor,
	}: {
		doc: yaml.Document
		visitor: (
			args: Parameters<NoodlVisitorFn>[0],
			utils: Parameters<NoodlVisitorFn>[1],
		) => ReturnType<yaml.visit>
	}) {
		return (...[key, node, path]: OrigVisitorArgs) => {
			return visitor({ doc, key, node, path }, util)
		}
	}

	return {
		visit(doc: yaml.Document, visitor: NoodlVisitorFn) {
			yaml.visit(doc, enhanceOriginalVisitor({ doc, visitor }))
		},
	}
})()

export default NoodlVisitor
