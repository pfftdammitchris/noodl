import type { Node } from 'yaml'
import type { OrArray } from '@jsmanifest/typefest'
import type { InternalComposerBaseArgs } from './internalTypes'
import type Page from '../Page'

export interface BaseStructure {
	ext: string
	filename: string
	group:
		| 'config'
		| 'document'
		| 'image'
		| 'page'
		| 'script'
		| 'video'
		| 'unknown'
}

export interface FileStructure extends BaseStructure {
	dir: string
	filepath: string
	rootDir: string
}

export interface LinkStructure extends BaseStructure {
	isRemote: boolean
	url: string
}

export type LoadType = 'doc' | 'json' | 'yml'
export type LoadFilesAs = 'list' | 'map' | 'object'

export interface LoadFilesOptions<
	LType extends LoadType = 'yml',
	LFType extends LoadFilesAs = 'list',
> {
	as?: LFType
	includeExt?: boolean
	preload?: OrArray<string>
	spread?: OrArray<string>
	type?: LType
}

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

export declare namespace NoodlVisitor {
	export interface Visit {
		(args: Args[0]): OriginalVisitor.ReturnType
	}

	export type Args = [
		{
			node: Node
		} & InternalComposerBaseArgs &
			OriginalVisitor.ArgsObject,
	]
}

export type Pages = Map<string, Page>
