import path from 'path'
import isVid from './isVid'
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
	} else if (/.(json|docx|doc|pdf)$/i.test(structure.ext)) {
		structure.group = 'document'
	} else if (/.(jpg|jpeg|gif|png|tif|svg)$/i.test(structure.ext)) {
		structure.group = 'image'
	} else if (structure.ext === '.js') {
		structure.group = 'script'
	} else if (isVid(parsed.base)) {
		structure.group = 'video'
	} else {
		structure.group = 'unknown'
	}

	return structure
}

export default getFileStructure
