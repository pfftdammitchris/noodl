import {
	basename,
	isAbsolute as isAbsolutePath,
	resolve as resolvePath,
} from 'path'
import normalizePath from './normalizePath'

/**
 * Returns the path as an absolute path
 * @param { string[] } paths
 * @returns { string }
 */
export function getAbsFilePath(...paths: string[]) {
	const filepath = normalizePath(...paths)
	if (isAbsolutePath(filepath)) return filepath
	return resolvePath(normalizePath(process.cwd(), ...paths))
}

/**
 * Returns the file name from the file path (including the ext)
 * Supply a 2nd parameter to remove the ext (ex: '.tsx)
 * @param { string } str
 * @param { string } ext
 * @returns { string }
 */
export function getFileName(str: string | undefined = '', ext?: string) {
	if (!ext) return basename(str)
	return basename(str, ext.startsWith('.') ? ext : `.${ext}`)
}
