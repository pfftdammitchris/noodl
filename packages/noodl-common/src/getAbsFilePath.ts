import path from 'path'
import normalizePath from './normalizePath'

function getAbsFilePath(...paths: string[]) {
	const filepath = normalizePath(...paths)
	if (path.isAbsolute(filepath)) return filepath
	return path.resolve(normalizePath(process.cwd(), ...paths))
}

export default getAbsFilePath
