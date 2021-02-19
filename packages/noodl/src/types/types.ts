import { Node } from 'yaml/types'
import NoodlPage from '../NoodlPage'
import NoodlRoot from '../NoodlRoot'
import getTransformer from '../internal/transformers'
import getVisitorUtils from '../internal/getVisitorUtils'
import { YAMLNode } from './internalTypes'
import * as scalarUtil from '../utils/scalar'
import * as seqUtil from '../utils/seq'
import * as mapUtil from '../utils/map'

export type OrigVisitorArgs<N extends Node = Node> = [
	key: null | number | 'key' | 'value',
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

export interface NoodlVisit<N extends YAMLNode> {
	(node?: N | never): OrigVisitorReturnType
}

export interface NoodlVisitorFn {
	(args: NoodlVisitorNodeArgs, util: NoodlVisitorUtils): OrigVisitorReturnType
}

export interface NoodlVisitorNodeArgs extends OrigVisitorArgsAsObject {
	node: Node
	pages: NoodlPages
	root: NoodlRoot
}

export type NoodlVisitorUtils = typeof scalarUtil &
	typeof mapUtil &
	typeof seqUtil &
	ReturnType<typeof getVisitorUtils> & {
		transform: ReturnType<typeof getTransformer>
	}

export type NoodlVisitorArgs = Parameters<NoodlVisitorFn>
