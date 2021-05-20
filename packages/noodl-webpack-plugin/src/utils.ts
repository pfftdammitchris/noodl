import { URL } from 'url'
import fs from 'fs-extra'
import path from 'path'

export function getFilename(str: string = '') {
	if (!str.includes('/')) return str
	return str.substring(str.lastIndexOf('/') + 1)
}

export function getExt(str: string) {
	return str.includes('.') ? str.substring(str.lastIndexOf('.') + 1) : ''
}

export function getFilePath(...paths: string[]) {
	return path.normalize(path.resolve(path.join(process.cwd(), ...paths)))
}

export function isImg(s: string) {
	return /([a-z\-_0-9\/\:\.]*\.(jpg|jpeg|png|gif|bmp|tif))/i.test(s)
}

export function isPdf(s: string) {
	return s.endsWith('.pdf')
}

export function isVid(s: string) {
	return /([a-z\-_0-9\/\:\.]*\.(mp4|avi|wmv))/i.test(s)
}

export function isYml(s: string) {
	return s.endsWith('.yml')
}

export function loadFile(filepath: string) {
	return fs.readFileSync(filepath, 'utf8')
}

export interface MetadataObject {
	ext: string
	filename: string
	filepath: string
	group: 'documents' | 'images' | 'page' | 'scripts' | 'videos'
	link?: string
	pathname: string
	raw: string
}

/** @param { 'filepath' | 'link' } type */
export function createMetadataExtractor(type: 'filepath' | 'link') {
	// type GetMetadataObjectArgsObject = Partial<{ [K in typeof type]: string }> & {
	// 	baseUrl?: string
	// 	prefix?: string
	// 	tilde?: string
	// }

	function getMetadataObject(s: string | { baseUrl: string; prefix: string }) {
		const metadata = {} as MetadataObject

		let value = typeof s === 'string' ? s : s[type]

		metadata.raw = value
		metadata.ext = getExt(value)
		metadata.filename = getFilename(value)

		if (value.startsWith('http')) {
			const url = new URL(value)
			metadata.pathname = url.pathname
		} else {
			metadata.pathname = value.startsWith('/') ? value : `/${value}`
		}

		if (typeof s === 'string') {
			if (type === 'link') {
				if (value.startsWith('http')) metadata.link = value
				// The link is a pathname, so we need to construct the protocol/hostname
				// TODO - Find a way to get the hostname here?
				else metadata.link = value
			} else {
				metadata.filepath = getFilePath(value)
			}
		} else {
			if (type === 'link') {
				const { baseUrl = '', prefix = '' } = s
				metadata.link = baseUrl
				prefix && (metadata.link += `${prefix}`)
				metadata.link += metadata.pathname.startsWith('/')
					? metadata.pathname
					: `/${metadata.pathname}`
			} else {
				metadata.filepath = s.prefix
					? getFilePath(path.join(s.prefix, s[type]))
					: getFilePath(s[type])
			}
		}

		if (isImg(value)) {
			metadata.group = 'images'
		} else if (isPdf(value)) {
			metadata.group = 'documents'
		} else if (isVid(value)) {
			metadata.group = 'videos'
		} else if (value.endsWith('.html') || value.endsWith('.js')) {
			metadata.group = 'scripts'
		}

		return metadata
	}

	return getMetadataObject
}
