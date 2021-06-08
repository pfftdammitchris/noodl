import * as u from '@jsmanifest/utils'
import curry from 'lodash/curry'
import flip from 'lodash/flip'
import partial from 'lodash/partial'
import partialRight from 'lodash/partialRight'
import unary from 'lodash/unary'
import fs from 'fs-extra'
import https from 'https'
import { Document, isMap, isScalar, isDocument } from 'yaml'
import { MetadataObject } from './types'

export function createPlaceholderReplacers(
	replacers: [string, any][],
	flags: string = 'g',
) {
	const regexReplacers = replacers.map(
		([placeholder, placeholderValue], i) =>
			[
				new RegExp(
					placeholder.includes('$')
						? placeholder.replace('$', '\\$')
						: placeholder,
					flags,
				),
				placeholderValue,
			] as [RegExp, any],
	)
	function replace(str: string | Record<string, any>) {
		let data = u.isStr(str) ? str : JSON.stringify(str)
		for (const [regex, placeholderValue] of regexReplacers) {
			data = regex.test(data) ? data.replace(regex, placeholderValue) : data
		}
		return data
	}
	return replace
}

export function createPlaceholderReplacer(
	placeholders: string | string[],
	flags?: string,
) {
	const regexp = new RegExp(
		u.reduce(
			u.array(placeholders),
			(str, placeholder) =>
				str +
				(!str
					? placeholder.replace('$', '\\$')
					: `|${placeholder.replace('$', '\\$')}`),
			'',
		),
		flags,
	)

	function replace(str: string, value: string | number): string
	function replace<Obj extends Record<string, any> = any>(
		obj: Obj,
		value: string | number,
	): Obj
	function replace<Obj extends Record<string, any> = any>(
		str: string | Obj,
		value: string | number,
	) {
		if (u.isStr(str)) {
			return str.replace(regexp, String(value))
		} else if (u.isObj(str)) {
			const stringified = JSON.stringify(str).replace(regexp, String(value))
			return JSON.parse(stringified)
		}
		return ''
	}

	return replace
}

export function ensureBeginsWithSingleSlash(s: string) {
	if (!s.startsWith('/')) s = '/' + s
	if (s.startsWith('//')) s = s.replace('//', '/')
	return s
}

export function ensurePageName(s: string) {
	if (isYml(s)) s = s.substring(0, s.lastIndexOf('.yml'))
	if (s.startsWith('/')) s = s.replace('/', '')
	return s
}

export function getExt(str: string) {
	return str.includes('.') ? str.substring(str.lastIndexOf('.') + 1) : ''
}

export function isImg(s: string) {
	return /([a-z\-_0-9/:.]*\.(jpg|jpeg|png|gif|bmp|tif))/i.test(s)
}

export function isVid(s: string) {
	return /([a-z\-_0-9/:.]*\.(mp4|avi|wmv))/i.test(s)
}

export function isYml(s: string) {
	return s.endsWith('.yml')
}

export function isPageDoc(doc: Document | Document.Parsed | undefined | null) {
	if (
		doc &&
		isDocument(doc) &&
		isMap(doc.contents) &&
		doc.contents.items.length === 1
	) {
		const node = doc.contents.items[0].key
		if (isScalar(node) && typeof node.value === 'string') {
			return node.value[0] === node.value[0].toUpperCase()
		}
	}
	return false
}

export function loadFile(filepath: string) {
	return fs.readFileSync(filepath, 'utf8')
}

export const getMetadataObject = (function () {
	function getFilename(str: string = '') {
		return !str.includes('/') ? str : str.substring(str.lastIndexOf('/') + 1)
	}
	function getMetadataObject(
		value: string,
		{ config }: { config?: string } = {},
	) {
		const metadata = {} as MetadataObject

		metadata.ext = getExt(value)
		metadata.filename = getFilename(value)
		metadata.filepath = value

		if (isYml(value)) {
			if (metadata.filename.endsWith('.yml')) {
				metadata.filename = metadata.filename.substring(
					0,
					metadata.filename.lastIndexOf('.yml'),
				)
			}
			metadata.group = metadata.filename === config ? 'config' : 'page'
		} else if (isImg(value)) {
			metadata.group = 'image'
		} else if (/(json|pdf)/i.test(value)) {
			metadata.group = 'document'
		} else if (isVid(value)) {
			metadata.group = 'video'
		} else if (value.endsWith('.html') || value.endsWith('.js')) {
			metadata.group = 'script'
		}
		return metadata
	}
	return getMetadataObject
})()

export const replaceBaseUrlPlaceholder = createPlaceholderReplacer(
	'${cadlBaseUrl}',
	'g',
)

export const replaceDesignSuffixPlaceholder = createPlaceholderReplacer(
	'${designSuffix}',
	'g',
)

export const replaceTildePlaceholder = createPlaceholderReplacer('~/')

export const replaceVersionPlaceholder = createPlaceholderReplacer(
	'${cadlVersion}',
	'g',
)

export function request(url: string) {
	return new Promise((resolve, reject) => {
		const req = https.get(url)
		req.on('response', (res) => {
			let data = ''
			res
				.on('data', (chunk: Buffer | string) => {
					if (Buffer.isBuffer(chunk)) data += chunk.toString('utf8')
					else if (u.isStr(chunk)) data += chunk
				})
				.on('end', () => resolve(data))
				.on('error', reject)
		})
	})
}
