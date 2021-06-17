import path from 'path'
import isVid from './isVid'
import { MetadataFileObject } from './types'

function getFileMetadataObject(filepath: string, opts?: { config?: string }) {
	const parsed = path.parse(filepath)
	const metadata = {
		dir: parsed.dir,
		ext: parsed.ext,
		filename: parsed.name,
		filepath,
		rootDir: parsed.root,
	} as MetadataFileObject

	if (parsed.ext === '.yml') {
		if (opts?.config === parsed.name || opts?.config === parsed.base) {
			metadata.group = 'config'
		} else {
			metadata.group = 'page'
		}
	} else if (/.(json|docx|doc|pdf)$/i.test(parsed.ext)) {
		metadata.group = 'document'
	} else if (/.(jpg|jpeg|gif|png|tif|svg|)$/i.test(parsed.ext)) {
		metadata.group = 'image'
	} else if (parsed.ext === '.js') {
		metadata.group = 'script'
	} else if (isVid(parsed.base)) {
		metadata.group = 'video'
	} else {
		metadata.group = 'unknown'
	}

	return metadata
}

export default getFileMetadataObject
