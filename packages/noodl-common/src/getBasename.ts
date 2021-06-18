import path from 'path'

function getBasename(str: string | undefined = '', ext?: string) {
	if (!ext) return path.posix.basename(str)
	return path.posix.basename(str, ext.startsWith('.') ? ext : `.${ext}`)
}

export default getBasename
