import path from 'path'
import isImage from './isImage'
import isVideo from './isVideo'
import { FileStructure } from './types'

function getFileStructure(filepath: string, opts?: { config?: string }) {
	const parsed = path.parse(filepath)
	const structure = {
		dir: parsed.dir,
		ext: parsed.ext,
		filename: parsed.name,
		filepath,
		rootDir: parsed.root,
	} as FileStructure

	if (structure.ext === '.yml') {
		if (
			opts?.config &&
			(opts?.config === parsed.name || opts?.config === parsed.base)
		) {
			structure.group = 'config'
		} else {
			structure.group = 'page'
		}
	} else if (isImage(parsed.base)) {
		structure.group = 'image'
	} else if (structure.ext === '.js') {
		structure.group = 'script'
	} else if (/[.\/]*(doc|docx|json|pdf)$/i.test(parsed.base)) {
		structure.group = 'document'
	} else if (isVideo(parsed.base)) {
		structure.group = 'video'
	} else {
		structure.group = 'unknown'
	}

	return structure
}

export default getFileStructure
