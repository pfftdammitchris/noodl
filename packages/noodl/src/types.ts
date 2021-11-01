import type { OrArray } from '@jsmanifest/typefest'
import type { YAMLNode, visitorFn } from './internal/yaml.js'

export type YAMLVisitArgs<N> = Parameters<visitorFn<N>>

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

export interface MetaObject<N = any> {
	_node?: N
	key?: string
	value?: any
	length?: number
	keys?: string[]
	isReference?: boolean
	isRootKey?: boolean
}

export interface Root {
	[key: string]: YAMLNode | null | undefined
}
