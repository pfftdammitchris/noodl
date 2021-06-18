import { isAbsolute, resolve as resolvePath } from 'path'
import normalizePath from './normalizePath'

function getAbsFilePath(...paths: string[]) {
	const filepath = normalizePath(...paths)
	if (isAbsolute(filepath)) return filepath
	return resolvePath(normalizePath(process.cwd(), ...paths))
}

export default getAbsFilePath
