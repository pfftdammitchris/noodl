import { Node, Pair, Scalar, YAMLMap, YAMLSeq } from 'yaml/types'
import yaml from 'yaml'
import NoodlPage from '../NoodlPage'
import NoodlRoot from '../NoodlRoot'
import { YAMLNode } from '../../../src/types'
import {
	hasAllKeys,
	hasAnyKeys,
	hasKey,
	hasKeyEqualTo,
	isScalar,
	isPair,
	isYAMLMap,
	isYAMLSeq,
} from '../../../src/utils/doc'
import getTransformer from '../internal/transformers'
import getVisitorUtils from '../internal/getVisitorUtils'
import * as docUtil from '../utils/doc'
import * as scalarUtil from '../utils/scalar'
import * as seqUtil from '../utils/seq'
import * as mapUtil from '../utils/map'

export { NoodlRoot, NoodlPage }

export type OrigVisitorArgs<N extends Node = Node> = [
	key: number | 'key' | 'value',
	node: N,
	path: Node[],
]

export interface OrigVisitorArgsAsObject<N extends Node = Node> {
	key: OrigVisitorArgs[0]
	node: OrigVisitorArgs<N>[1]
	path: OrigVisitorArgs[2]
}

export type OrigVisitorReturnType = number | symbol | void | Node

export type NoodlPages = Map<string, NoodlPage>

export type NoodlVisitNodeArg =
	| NoodlPage
	| YAMLNode
	| yaml.Document.Parsed
	| NoodlVisitorFn

export interface NoodlVisit<N extends YAMLNode> {
	(node?: N | never): OrigVisitorReturnType
}

export interface NoodlVisitorFn {
	(args: NoodlVisitorNodeArgs, util: NoodlVisitorUtils): OrigVisitorReturnType
}

export interface NoodlVisitorNodeArgs extends OrigVisitorArgsAsObject {
	node: YAMLNode
	page: NoodlPage
	pages: NoodlPages
	root: NoodlRoot
}

export type NoodlVisitorUtils = NoodlVisitorBaseUtils &
	ReturnType<typeof getVisitorUtils> & {
		transform: ReturnType<typeof getTransformer>
	}

export type NoodlVisitorBaseUtils = typeof docUtil &
	typeof scalarUtil &
	typeof mapUtil &
	typeof seqUtil & {
		hasAllKeys: typeof hasAllKeys
		hasAnyKeys: typeof hasAnyKeys
		hasKey: typeof hasKey
		hasKeyEqualTo: typeof hasKeyEqualTo
		isScalar: typeof isScalar
		isPair: typeof isPair
		isMap: typeof isYAMLMap
		isSeq: typeof isYAMLSeq
	}

export type NoodlVisitorArgs = Parameters<NoodlVisitorFn>
