import path from 'path'
import mime from 'mime'
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
	const mimeType = mime.lookup(filepath)

	if (structure.ext === '.yml') {
		if (
			opts?.config &&
			(opts?.config === parsed.name || opts?.config === parsed.base)
		) {
			structure.group = 'config'
		} else {
			structure.group = 'page'
		}
	} else if (/image/i.test(mimeType)) {
		structure.group = 'image'
	} else if (structure.ext === '.js') {
		structure.group = 'script'
	} else if (/application/i.test(mimeType)) {
		structure.group = 'document'
	} else if (/video/i.test(mimeType)) {
		structure.group = 'video'
	} else {
		structure.group = 'unknown'
	}

	return structure
}

export default getFileStructure
