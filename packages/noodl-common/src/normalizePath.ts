import path from 'path'

// Normalizes the path (compatible with win). Useful for globs to work expectedly
function normalizePath(...s: string[]) {
	return (s.length > 1 ? path.join(...s) : s[0]).replace(/\\/g, '/')
}

export default normalizePath
