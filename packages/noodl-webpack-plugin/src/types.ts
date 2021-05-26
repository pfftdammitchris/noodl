import { Dirent } from 'fs'

export interface File {
	dirent: Dirent
	name: string
	path: string
}

export interface MetadataObject {
	ext: string
	filename: string
	filepath: string
	group: MetadataGroup
}

export type MetadataGroup =
	| 'config'
	| 'document'
	| 'image'
	| 'page'
	| 'script'
	| 'video'

export namespace Message {
	export interface Base {
		type: string
		from?: 'webext'
		[key: string]: any
	}

	export interface TrackProperty extends Base {
		type: 'track'
		key: string
		label: string
		color?: string
		[key: string]: any
	}
}
