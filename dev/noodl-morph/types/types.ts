import { Node, Pair, Scalar, YAMLMap, YAMLSeq } from 'yaml/types'
import yaml from 'yaml'
import NoodlPage from '../NoodlPage'
import { isScalar, isPair, isYAMLMap, isYAMLSeq } from '../../../src/utils/doc'
import * as docUtil from '../utils/doc'
import * as scalarUtil from '../utils/scalar'
import * as seqUtil from '../utils/seq'
import * as mapUtil from '../utils/map'
import { YAMLNode } from '../../../src/types'

export interface Root {
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

export type NoodlPages = Map<string, NoodlPage>

export interface NoodlVisitorFn {
	(args: NoodlVisitorNodeArgs, util: NoodlVisitorUtils): OrigVisitorReturnType
}

export interface NoodlVisitorNodeArgs extends OrigVisitorArgsAsObject {
	page: NoodlPage
	pages: NoodlPages
	root: Root
}

export type NoodlVisitorArgs = Parameters<NoodlVisitorFn>

export type NoodlVisitorBaseUtils = typeof docUtil &
	typeof scalarUtil &
	typeof mapUtil &
	typeof seqUtil & {
		isScalar: typeof isScalar
		isPair: typeof isPair
		isMap: typeof isYAMLMap
		isSeq: typeof isYAMLSeq
	}

export type NoodlVisitorUtils = NoodlVisitorBaseUtils & {
	getNodeAtLocalOrRoot(
		path: string,
	): Node | YAMLMap | yaml.Document | yaml.Document.Parsed | NoodlPage
	transform<N extends Scalar | Pair | YAMLMap | YAMLSeq>(node: N): N
}

export declare function visit(page: NoodlPage): OrigVisitorReturnType
export declare function visit(node: YAMLNode): OrigVisitorReturnType
export declare function visit(doc: yaml.Document.Parsed): OrigVisitorReturnType
export declare function visit(visit: NoodlVisitorFn): OrigVisitorReturnType
export declare function visit(root: Root): OrigVisitorReturnType
export declare function visit(arg: never): OrigVisitorReturnType
