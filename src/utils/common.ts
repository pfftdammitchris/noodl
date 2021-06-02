import { AxiosError } from 'axios'
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

export function createGroupedMetadataObjects<
	O extends Record<string, any> = Record<string, any>,
>(init?: Partial<O>) {
	return {
		documents: [] as string[],
		images: [] as string[],
		scripts: [] as string[],
		videos: [] as string[],
		...init,
	}
}

export function ensureSlashPrefix(s: string) {
	if (!s.startsWith('/')) s = `/${s}`
	return s
}

export function ensureSuffix(value: string, s: string) {
	if (!value.endsWith(s)) value = `${value}${s}`
	return value
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

export const createFileMetadataExtractor = (function () {
	function getFilename(str: string = '') {
		return !str.includes('/') ? str : str.substring(str.lastIndexOf('/') + 1)
	}
	function getFileMetadataObject(
		value: string,
		{ config }: { config?: string } = {},
	) {
		const metadata = {} as t.MetadataFileObject

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
	return getFileMetadataObject
})()

export const createLinkMetadataExtractor = (function () {
	function getFilename(str: string = '') {
		return !str.includes('/') ? str : str.substring(str.lastIndexOf('/') + 1)
	}
	function getLinkMetadataObject(
		value: string,
		{
			config,
			ext = getExt(value),
			filename = getFilename(value),
			name = value.includes('.')
				? value.substring(0, value.lastIndexOf('.') + 1)
				: value,
			url = '',
		}: {
			config?: string
			ext?: string
			filename?: string
			name?: string
			url?: string
		} = {},
	) {
		name.endsWith('.') && (name = name.substring(0, name.lastIndexOf('.')))
		name.includes('/') && (name = name.substring(name.lastIndexOf('/') + 1))
		const isRemote = value.startsWith('http')
		const metadata = {
			ext,
			filename,
			isRemote,
			name,
			url,
		} as t.MetadataLinkObject
		if (isImg(`.${ext}`)) {
			metadata.group = 'image'
		} else if (/(json|pdf)$/i.test(ext)) {
			metadata.group = 'document'
		} else if (isVid(`.${ext}`)) {
			metadata.group = 'video'
		} else if (/(html|js)$/i.test(ext)) {
			metadata.group = 'script'
		}
		return metadata
	}
	return getLinkMetadataObject
})()

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
	return /([a-z-_0-9\/\:\.]*\.(jpg|jpeg|png|gif|bmp|tif))/i.test(s)
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
		return str.endsWith(suffix) ? str : `${str}${suffix}`
	}
}
export const withEngLocale = withSuffix('_en')
export const withJsonExt = withSuffix('.json')
export const withYmlExt = withSuffix('.yml')

export function withoutExt(str: string) {
	return hasDot(str) ? str.substring(str.lastIndexOf('.')) : str
}
