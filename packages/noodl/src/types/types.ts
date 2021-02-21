import { Node } from 'yaml/types'
import { InternalComposerBaseArgs, YAMLNode } from './internalTypes'
import Page from '../Page'
import NoodlUtils from '../Utils'
import Transformer from '../Transformer'

export declare namespace OriginalVisitor {
	export type ArgsList<N extends Node = Node> = [
		key: null | number | 'key' | 'value',
		node: N,
		path: Node[],
	]

	export interface ArgsObject<N extends Node = Node> {
		key: ArgsList[0]
		node: ArgsList<N>[1]
		path: ArgsList[2]
	}

	export type ReturnType = number | symbol | void | Node
}

export declare namespace NoodlTransformer {
	export interface Execute<N extends Node | YAMLNode = Node | YAMLNode> {
		(this: Transformer, node: N, util: NoodlVisitor.Utils): void
	}
}

export declare namespace NoodlVisitor {
	export type Utils = NoodlUtils

	export interface Visit {
		(args: Args[0], util: Args[1]): OriginalVisitor.ReturnType
	}

	export type Args = [
		{
			node: Node
		} & InternalComposerBaseArgs &
			OriginalVisitor.ArgsObject,
		Utils,
	]
}

export type Pages = Map<string, Page>
