import * as u from '@jsmanifest/utils'
import { YAMLMap } from 'yaml'
import { AcceptArray } from '@jsmanifest/typefest'

export type KeyOf<N extends YAMLMap | Record<string, any>> = N extends YAMLMap
	? YAMLMap['items'][number]['key']
	: keyof N

export type ValueOf<N extends YAMLMap | Record<string, any>> = N extends YAMLMap
	? YAMLMap['items'][number]['value']
	: N[keyof N]

export interface BaseStructure {
	ext: string
	filename: string
	group: StructureGroup
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

export type StructureGroup =
	| 'config'
	| 'document'
	| 'image'
	| 'page'
	| 'script'
	| 'video'
	| 'unknown'

export type LoadType = 'doc' | 'json' | 'yml'
export type LoadFilesAs = 'list' | 'map' | 'object'

export interface LoadFilesOptions<
	LType extends LoadType = 'yml',
	LFType extends LoadFilesAs = 'list',
> {
	as?: LFType
	includeExt?: boolean
	preload?: AcceptArray<string>
	spread?: AcceptArray<string>
	type?: LType
}
