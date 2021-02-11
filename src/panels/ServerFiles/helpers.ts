import fs from 'fs-extra'
import path from 'path'
import * as T from './types'
import * as u from '../../utils/common'

export function createGroupedObject(
	initial?: Partial<T.ServerFilesGroupedFiles>,
): T.ServerFilesGroupedFiles {
	return {
		documents: {},
		images: {},
		videos: {},
		...initial,
	}
}

export function createMetadataReducer(
	pred: (filestats: fs.Stats, filepath: string) => boolean,
) {
	return (serverDir: string) => {
		return function metadataReducer(acc: T.MetadataObject[], filename: string) {
			const filepath = path.join(serverDir, filename)
			const stat = fs.statSync(filepath)
			if (pred(stat, filepath)) return acc.concat(getFilepathMetadata(filepath))
			return acc
		}
	}
}

export function getFilepathMetadata(args: {
	filepath: string
	prefix?: string
}): T.MetadataObject
export function getFilepathMetadata(filepath: string): T.MetadataObject
export function getFilepathMetadata(
	args: string | { filepath: string; prefix?: string },
): T.MetadataObject {
	const metadata = {} as T.MetadataObject

	if (args && typeof args === 'object') {
		metadata.filepath = args.filepath
	} else if (typeof args === 'string') {
		metadata.filepath = args
	}

	const { filepath } = metadata
	const hasDot = filepath.includes('.')
	const hasSlash = filepath.includes('/')

	if (hasSlash) {
		metadata.pathname = filepath.substring(metadata.filepath.lastIndexOf('/'))
	} else {
		metadata.pathname = filepath
	}

	if (hasDot) {
		metadata.ext = filepath.substring(filepath.lastIndexOf('.') + 1)

		if (u.isImg(filepath)) {
			metadata.group = 'image'
		} else if (u.isPdf(filepath)) {
			metadata.group = 'document'
		} else if (u.isVid(filepath)) {
			metadata.group = 'video'
		} else if (u.isHtml(filepath) || u.isJs(filepath)) {
			metadata.group = 'script'
		}
	}

	return metadata
}

export function getAssetType(url: string) {
	if (u.isImg(url)) return 'image'
	else if (u.isVid(url)) return 'video'
	else if (u.isPdf(url)) return 'pdf'
	else if (u.isJs(url)) return 'javascript'
	else if (url.endsWith('.html')) return 'html'
	else if (url.endsWith('.yml')) return 'yaml'
	else if (url.endsWith('.json')) return 'json'
	else return ''
}
