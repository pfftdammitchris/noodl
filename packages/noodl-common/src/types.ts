export type LoadType = 'doc' | 'json' | 'yml'
export type LoadFilesAs = 'list' | 'map' | 'object'

export type MetadataGroup =
	| 'config'
	| 'document'
	| 'image'
	| 'page'
	| 'script'
	| 'video'
	| 'unknown'

export interface MetadataBaseObject {
	ext: string
	filename: string
	group: MetadataGroup
}

export interface MetadataFileObject extends MetadataBaseObject {
	dir: string
	filepath: string
	rootDir: string
}

export interface MetadataLinkObject extends MetadataBaseObject {
	isRemote: boolean
	name: string
	url: string
}
