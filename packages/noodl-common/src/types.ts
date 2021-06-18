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
	onFile?(args: { file: Document; filename: string }): void
	type?: LType
}
