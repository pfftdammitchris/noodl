import path from 'path'

/**
 * Normalizes the path (compatible with win).
 * Useful for globs to work expectedly
 * @param s String paths
 * @returns { string }
 */
function normalizePath(...s: string[]) {
	let result = (s.length > 1 ? path.join(...s) : s[0]).replace(/\\/g, '/')
	if (result.includes('/~/')) result = result.replace('~/', '')
	return result
}

export default normalizePath
