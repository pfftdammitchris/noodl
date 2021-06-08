export type MetadataGroup =
	| 'config'
	| 'document'
	| 'image'
	| 'page'
	| 'script'
	| 'video'

export interface MetadataBaseObject {
	ext: string
	filename: string
	group: MetadataGroup
}

export interface MetadataFileObject extends MetadataBaseObject {
	filepath: string
}

export interface MetadataLinkObject extends MetadataBaseObject {
	isRemote: boolean
	name: string
	url: string
}
