import path from 'path'

/**
 * Returns the base name of the file path. A base name contains the file name
 * including its ext
 * @param { string } str
 * @param { string } ext
 * @returns { string }
 */
function getBasename(str: string | undefined = '', ext?: string) {
	if (!ext) return path.posix.basename(str)
	return path.posix.basename(str, ext.startsWith('.') ? ext : `.${ext}`)
}

export default getBasename
