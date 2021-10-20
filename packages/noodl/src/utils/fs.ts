import {
	basename,
	isAbsolute as isAbsolutePath,
	join as joinPath,
	parse as parsePath,
	resolve as resolvePath,
} from 'path'
import * as t from '../types'

/**
 * Returns the path as an absolute path
 * @param { string[] } paths
 * @returns { string }
 */
export function getAbsFilePath(...paths: string[]) {
	const filepath = normalizeFilePath(...paths)
	if (isAbsolutePath(filepath)) return filepath
	return resolvePath(normalizeFilePath(process.cwd(), ...paths))
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

/**
 * @param { string } filepath
 * @param { object } opts
 * @param { string } [opts.config]
 * @returns { FileStructure }
 */
export function getFileStructure(filepath: string, opts?: { config?: string }) {
	const parsed = parsePath(filepath)
	const structure = {
		dir: parsed.dir,
		ext: parsed.ext,
		filename: parsed.name,
		filepath,
		rootDir: parsed.root,
	} as t.FileStructure

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
	} else if (structure.ext === '') {
		structure.group = 'script'
	} else if (/[./]*(doc|docx|json|pdf)$/i.test(parsed.base)) {
		structure.group = 'document'
	} else if (isVideo(parsed.base)) {
		structure.group = 'video'
	} else {
		structure.group = 'unknown'
	}

	return structure
}

/**
 * @param { string } link
 * @param { object } opts
 * @returns { LinkStructure }
 */
export function getLinkStructure(
	link: string,
	opts?: { config?: string; prefix?: string },
) {
	const parsed = parsePath(link)
	const structure = {
		ext: parsed.ext,
		filename: parsed.name,
		isRemote: /^(http|www)/i.test(link),
		url: opts?.prefix
			? `${opts.prefix}${opts.prefix.endsWith('/') ? link : `/${link}`}`
			: link,
	} as t.LinkStructure

	if (opts?.config === structure.filename) {
		structure.group = 'config'
	} else if (structure.ext.endsWith('.yml')) {
		structure.group = 'page'
	} else if (/.*(bmp|gif|jpg|jpeg|png|tif)$/i.test(structure.ext)) {
		structure.group = 'image'
	} else if (/.*(doc|docx|json|pdf)$/i.test(structure.ext)) {
		structure.group = 'document'
	} else if (/.*(avi|mp4|mkv|wmv)$/i.test(structure.ext)) {
		structure.group = 'video'
	} else if (/.*(html)$/i.test(structure.ext)) {
		structure.group = 'script'
	} else {
		structure.group = 'unknown'
	}

	return structure
}

/**
 * Returns true if value is an image extension or mime type
 * @param { string } value
 * @returns { boolean }
 */
export function isImage(value = '') {
	return /([./]|image)*(bmp|gif|jpg|jpeg|png|svg|tif)$/i.test(value)
}

/**
 * Returns true if value is a video extension or mime type
 * @param { string } value
 * @returns { boolean }
 */
export function isVideo(value = '') {
	return /([./]|video)*(avi|flac|flv|mkv|mp4|mpg|ogg|wmv)$/i.test(value)
}

/**
 * Normalizes the path (compatible with win).
 * Useful for globs to work on windows systems
 * @param { ...string[] } s
 * @returns { string }
 */
export function normalizeFilePath(...s: string[]) {
	let result = (s.length > 1 ? joinPath(...s) : s[0]).replace(/\\/g, '/')
	if (result.includes('/~/')) result = result.replace('~/', '')
	return result
}
