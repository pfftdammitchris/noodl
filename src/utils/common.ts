import { AxiosError } from 'axios'
import { URL } from 'url'
import * as u from '@jsmanifest/utils'
import curry from 'lodash/curry'
import fs from 'fs-extra'
import path from 'path'
import chalk from 'chalk'
import yaml from 'yaml'
import globby from 'globby'
import * as co from './color'
import * as t from '../types'

export const withTag =
	(colorFunc = co.cyan) =>
	(s: string) =>
		`[${colorFunc(s)}]`

export function createGroupedMetadataObjects(
	init?: Partial<Record<string, any>>,
): Record<string, any> & {} {
	return {
		documents: [],
		images: [],
		scripts: [],
		videos: [],
		...init,
	}
}

export function createPlaceholderReplacer(
	placeholders: string | string[],
	flags?: string,
) {
	const regexp = new RegExp(
		(u.isArr(placeholders) ? placeholders : [placeholders]).reduce(
			(str, placeholder) => str + (!str ? placeholder : `|${placeholder}`),
			'',
		),
		flags,
	)
	function replace(str: string, value: string | number): string
	function replace<Obj extends {} = any>(obj: Obj, value: string | number): Obj
	function replace<Obj extends {} = any>(
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

export function forEachDeepKeyValue<O = any>(
	cb: (key: string, value: any, obj: { [key: string]: any }) => void,
	obj: O | O[],
) {
	if (u.isArr(obj)) {
		obj.forEach((v) => forEachDeepKeyValue(cb, v))
	} else if (u.isObj(obj)) {
		u.entries(obj).forEach(([key, value]) => {
			cb(key, value, obj)
			if (u.isObj(value) || u.isArr(value)) {
				forEachDeepKeyValue(cb, value)
			}
		})
	}
}

export function getCliConfig() {
	return yaml.parse(fs.readFileSync(getAbsFilePath('noodl.yml'), 'utf8'))
}

export function getExt(str: string) {
	return hasDot(str) ? str.substring(str.lastIndexOf('.') + 1) : ''
}

export function createMetadataExtractor(type: 'filepath' | 'link') {
	type GetMetadataObjectArgsObject = Partial<{ [K in typeof type]: string }> & {
		baseUrl?: string
		prefix?: string
		tilde?: string
	}

	function getMetadataObject(
		args: GetMetadataObjectArgsObject,
	): Record<string, any>
	function getMetadataObject(str: string): Record<string, any>
	function getMetadataObject(s: GetMetadataObjectArgsObject | string) {
		const metadata = {} as Record<string, any>

		const value = (u.isStr(s) ? s : s[type]) as string

		metadata.raw = value as string
		metadata.ext = getExt(value)
		metadata.filename = getFilename(value)

		if (value.startsWith('http')) {
			const url = new URL(value)
			metadata.pathname = url.pathname
		} else {
			metadata.pathname = value.startsWith('/') ? value : `/${value}`
		}

		if (u.isStr(s)) {
			if (type === 'link') {
				if (value.startsWith('http')) metadata.link = value
				// The link is a pathname, so we need to construct the protocol/hostname
				// TODO - Find a way to get the hostname here?
				else metadata.link = value
			} else {
				metadata.filepath = getAbsFilePath(value)
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
					? getAbsFilePath(path.join(s.prefix, s[type] as string))
					: getAbsFilePath(s[type] as string)
			}
		}

		if (isImg(value)) {
			metadata.group = 'images'
		} else if (isPdf(value)) {
			metadata.group = 'documents'
		} else if (isVid(value)) {
			metadata.group = 'videos'
		} else if (isHtml(value) || isJs(value)) {
			metadata.group = 'scripts'
		}

		return metadata
	}

	return getMetadataObject
}

export const getFilepathMetadata = createMetadataExtractor('filepath')
export const getLinkMetadata = createMetadataExtractor('link')

export function getPathname(str: string) {
	return hasSlash(str) ? str.substring(str.lastIndexOf('/') + 1) : ''
}

export function getFilename(str: string) {
	if (!hasSlash(str)) return str
	return str.substring(str.lastIndexOf('/') + 1)
}

export function getAbsFilePath(...paths: string[]) {
	return path.resolve(path.join(process.cwd(), ...paths))
}

export function hasCliConfig() {
	return fs.existsSync(getAbsFilePath('noodl.yml'))
}

export function hasDot(s: string) {
	return !!s?.includes('.')
}

export function hasSlash(s: string) {
	return !!s?.includes('/')
}

export function loadFileAsDoc(filepath: string) {
	return yaml.parseDocument(fs.readFileSync(filepath, 'utf8'))
}

export function loadFilesAsDocs(opts: {
	as: 'doc'
	dir: string
	includeExt?: boolean
	recursive: boolean
}): yaml.Document.Parsed[]
export function loadFilesAsDocs(opts: {
	as: 'metadataDocs'
	dir: string
	includeExt?: boolean
	recursive: boolean
}): { name: string; doc: yaml.Document.Parsed }[]
export function loadFilesAsDocs({
	as = 'doc',
	dir,
	includeExt = true,
	recursive = true,
}: {
	as?: 'doc' | 'metadataDocs'
	dir: string
	includeExt?: boolean
	recursive?: boolean
}) {
	const xform =
		as === 'metadataDocs'
			? (obj: any) => ({
					doc: loadFileAsDoc(obj.path),
					name: includeExt
						? obj.name
						: obj.name.includes('.')
						? obj.name.substring(0, obj.name.lastIndexOf('.'))
						: obj.name,
			  })
			: (fpath: string) => loadFileAsDoc(fpath)
	return globby
		.sync(path.join(dir, recursive ? '**/*.yml' : '*.yml'), {
			objectMode: as === 'metadataDocs',
			onlyFiles: true,
		})
		.map((fpath) => xform(fpath))
}

export function loadFiles(opts: {
	dir: string
	ext: 'yml'
	onFile?(args: { file: yaml.Document; filename: string }): void
}): yaml.Document[]
export function loadFiles(opts: {
	dir: string
	ext: 'json'
	onFile?(args: { file: Record<string, any>; filename: string }): void
}): Record<string, any>[]
export function loadFiles({
	dir,
	ext = 'json',
	onFile,
}: {
	dir: string
	ext?: 'json' | 'yml'
	onFile?(args: {
		file?: Record<string, any> | yaml.Document
		filename: string
	}): void
}) {
	return globby
		.sync(path.resolve(getAbsFilePath(dir), `**/*.${ext}`))
		.reduce((acc, filename) => {
			const file =
				ext === 'json'
					? fs.readJsonSync(filename)
					: yaml.parseDocument(fs.readFileSync(filename, 'utf8'))
			onFile?.({ file, filename })
			return acc.concat(file)
		}, [])
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

export function isYml(s: string = '') {
	return s.endsWith('.yml')
}

export function isJson(s: string = '') {
	return s.endsWith('.json')
}

export function isJs(s: string = '') {
	return s.endsWith('.js')
}

export function isHtml(s: string = '') {
	return s.endsWith('.html')
}

export function prettifyErr(err: AxiosError | Error) {
	if ('response' in err) {
		if (err?.response?.data) {
			return `[${chalk.yellow('AxiosError')}}]: ${err.response.data}`
		}
	}
	return `[${chalk.yellow(err.name)}]: ${chalk.red(err.message)}`
}

/**
 * Resolves an array of promises safely, inserting each result to the list
 * including errors that occurred inbetween.
 * @param { Promise[] } promises - Array of promises
 */
export async function promiseAllSafe(...promises: Promise<any>[]) {
	const results = [] as any[]
	for (let promise of promises) {
		try {
			const result = await promise
			results.push(result)
		} catch (error) {
			results.push(error)
		}
	}
	return results
}

export async function promiseAllSafelySplit(...promises: Promise<any>[]) {
	const results = [[], []] as [passed: any[], failed: any[]]
	for (let promise of promises) {
		try {
			results[0].push(await promise)
		} catch (error) {
			results[1].push(error)
		}
	}
	return results
}

export const replaceBaseUrlPlaceholder = createPlaceholderReplacer(
	'\\${cadlBaseUrl}',
	'g',
)

export const replaceDesignSuffixPlaceholder = createPlaceholderReplacer(
	'\\${designSuffix}',
	'g',
)

export const replaceTildePlaceholder = createPlaceholderReplacer('~/')

export const replaceVersionPlaceholder = createPlaceholderReplacer(
	'\\${cadlVersion}',
	'g',
)

export const saveJson = curry((filepath: string, data: any) =>
	fs.writeJsonSync(filepath, data, { spaces: 2 }),
)

export const saveYml = curry((filepath: string, data: any) =>
	fs.writeFileSync(filepath, data, { encoding: 'utf8' }),
)

export function sortObjPropsByKeys(obj: { [key: string]: any }) {
	return u
		.entries(obj)
		.sort((a, b) => {
			if (a[1] > b[1]) return -1
			if (a[1] === b[1]) return 0
			return 1
		})
		.reduce((acc, [key, value]) => Object.assign(acc, { [key]: value }), {})
}

export function withSuffix(suffix: string) {
	return function (str: string) {
		return `${str}${suffix}`
	}
}
export const withEngLocale = withSuffix('_en')
export const withJsonExt = withSuffix('.json')
export const withYmlExt = withSuffix('.yml')

export function withoutExt(str: string) {
	return hasDot(str) ? str.substring(str.lastIndexOf('.')) : str
}
