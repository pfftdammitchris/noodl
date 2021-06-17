import { JsonObject, LiteralUnion } from 'type-fest'
import * as u from '@jsmanifest/utils'
import { sync as globbySync } from 'globby'
import { existsSync, readFile, readFileSync, readJsonSync } from 'fs-extra'
import path from 'path'
import chalk from 'chalk'
import {
	Document,
	parse as parseYmlToJson,
	parseDocument as parseYmlToDoc,
} from 'yaml'
import * as t from './types'

export * from './types'
export const captioning = (...s: any[]) => chalk.hex('#40E09F')(...s)
export const highlight = (...s: any[]) => chalk.yellow(...s)
export const italic = (...s: any[]) => chalk.italic(chalk.white(...s))
export const aquamarine = (...s: any[]) => chalk.keyword('aquamarine')(...s)
export const lightGold = (...s: any[]) => chalk.keyword('blanchedalmond')(...s)
export const blue = (...s: any[]) => chalk.keyword('deepskyblue')(...s)
export const fadedBlue = (...s: any[]) => chalk.blue(...s)
export const cyan = (...s: any[]) => chalk.cyan(...s)
export const brightGreen = (...s: any[]) => chalk.keyword('chartreuse')(...s)
export const lightGreen = (...s: any[]) => chalk.keyword('lightgreen')(...s)
export const green = (...s: any[]) => chalk.green(...s)
export const coolGold = (...s: any[]) => chalk.keyword('navajowhite')(...s)
export const gray = (...s: any[]) => chalk.keyword('lightslategray')(...s)
export const hotpink = (...s: any[]) => chalk.hex('#F65CA1')(...s)
export const fadedSalmon = (...s: any[]) => chalk.keyword('darksalmon')(...s)
export const magenta = (...s: any[]) => chalk.magenta(...s)
export const orange = (...s: any[]) => chalk.keyword('lightsalmon')(...s)
export const deepOrange = (...s: any[]) => chalk.hex('#FF8B3F')(...s)
export const purple = (...s: any[]) => chalk.keyword('purple')(...s)
export const lightRed = (...s: any[]) => chalk.keyword('lightpink')(...s)
export const coolRed = (...s: any[]) => chalk.keyword('lightcoral')(...s)
export const red = (...s: any[]) => chalk.keyword('tomato')(...s)
export const teal = (...s: any[]) => chalk.keyword('turquoise')(...s)
export const white = (...s: any[]) => chalk.whiteBright(...s)
export const yellow = (...s: any[]) => chalk.yellow(...s)
export const newline = () => console.log('')

export function getFileMetadataObject(
	filepath: string,
	opts?: { config?: string },
) {
	const parsed = path.parse(filepath)
	const metadata = {
		dir: parsed.dir,
		ext: parsed.ext,
		filename: parsed.name,
		filepath,
		rootDir: parsed.root,
	} as t.MetadataFileObject

	if (parsed.ext === '.yml') {
		if (opts?.config === parsed.name || opts?.config === parsed.base) {
			metadata.group = 'config'
		} else {
			metadata.group = 'page'
		}
	} else if (/.(json|docx|doc|pdf)$/i.test(parsed.ext)) {
		metadata.group = 'document'
	} else if (/.(jpg|jpeg|gif|png|tif|svg|)$/i.test(parsed.ext)) {
		metadata.group = 'image'
	} else if (parsed.ext === '.js') {
		metadata.group = 'script'
	} else if (isVid(parsed.base)) {
		metadata.group = 'video'
	} else {
		metadata.group = 'unknown'
	}

	return metadata
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

export function ensureSlashPrefix(s: string) {
	if (!s.startsWith('/')) s = `/${s}`
	return s
}

export function ensureSuffix(value: string, s: string) {
	if (!value.endsWith(s)) value = `${value}${s}`
	return value
}

export function getExt(str: string) {
	return hasDot(str) ? str.substring(str.lastIndexOf('.') + 1) : ''
}

export function getPathname(str: string) {
	return hasSlash(str) ? str.substring(str.lastIndexOf('/') + 1) : ''
}

export function getFilename(str: string) {
	if (!hasSlash(str)) return str
	return str.substring(str.lastIndexOf('/') + 1)
}

export function getAbsFilePath(...paths: string[]) {
	const filepath = normalizePath(...paths)
	if (path.isAbsolute(filepath)) return filepath
	return path.resolve(normalizePath(process.cwd(), ...paths))
}

export function hasDot(s: string) {
	return !!s?.includes('.')
}

export function hasSlash(s: string) {
	return !!s?.includes('/')
}

/**
 * Loads a file at filepath relative to the current file
 * @param { string } filepath - File path of file to be loaded
 */
export function loadFile<T extends 'yml'>(
	filepath: string,
	type?: LiteralUnion<T, string>,
): string

export function loadFile<T extends 'doc'>(
	filepath: string,
	type: LiteralUnion<T, string>,
): Document

export function loadFile<T extends 'json'>(
	filepath: string,
	type: LiteralUnion<T, string>,
): Record<string, any>

export function loadFile<T extends t.LoadType = t.LoadType>(
	filepath: string,
	type: T,
) {
	if (u.isStr(filepath)) {
		if (!path.isAbsolute(filepath)) filepath = getAbsFilePath(filepath)
		if (existsSync(filepath)) {
			if (type) {
				if (type === 'doc') return parseYmlToDoc(readFileSync(filepath, 'utf8'))
				if (type === 'json')
					return parseYmlToJson(readFileSync(filepath, 'utf8'))
			}
			return readFileSync(filepath, 'utf8')
		}
	}
}

export function loadFiles<LType extends t.LoadType = 'yml'>(
	dir: string,
	type?: LType,
): LType extends 'doc'
	? Document[]
	: LType extends 'json'
	? Record<string, any>[]
	: string[]

export function loadFiles<
	LType extends t.LoadType,
	LFType extends t.LoadFilesAs,
>(
	dir: string,
	opts?: {
		as?: LFType
		onFile?(args: { file: Document; filename: string }): void
		type?: LType
	},
): LFType extends 'list'
	? t.MetadataFileObject[]
	: LFType extends 'map'
	? Map<string, t.MetadataFileObject>
	: LFType extends 'object'
	? Record<string, t.MetadataFileObject>
	: Record<string, t.MetadataFileObject>

export function loadFiles<
	LType extends t.LoadType = t.LoadType,
	LFType extends t.LoadFilesAs = t.LoadFilesAs,
>(
	args: string,
	opts:
		| t.LoadType
		| {
				as?: LFType
				onFile?(args: { file: Document; filename: string }): void
				type?: LType
		  } = 'yml',
) {
	let ext = 'yml'
	if (u.isStr(args) && (!opts || u.isStr(opts))) {
		if (opts === 'json') ext = 'json'
		const dir = getAbsFilePath(args)
		const glob = `**/*.${ext}`
		return globbySync(path.join(dir, glob)).map((filepath) =>
			loadFile(filepath, opts),
		)
	}
	if (u.isObj(args)) {
		ext = args.ext || ext
		const result = {}
		const dir = getAbsFilePath(args.dir)
		const glob = `**/*.${ext}`
		const filepaths = globbySync(
			path.normalize(path.join(getAbsFilePath(dir), glob)),
			{ onlyFiles: true },
		)
		for (const filepath of filepaths) {
			const metadata = getFileMetadataObject(filepath)
			const filedata =
				ext === 'json'
					? JSON.parse(readFileSync(filepath, 'utf8'))
					: args.raw
					? readFileSync(filepath, 'utf8')
					: parseYmlToDoc(readFileSync(filepath, 'utf8'))
			result[filepath] = filedata
		}
	}
}

export function loadFileAsDoc(filepath: string) {
	return parseYmlToDoc(readFileSync(filepath, 'utf8'))
}

export function loadFilesAsDocs(opts: {
	as: 'doc'
	dir: string
	includeExt?: boolean
	recursive: boolean
}): Document.Parsed[]

export function loadFilesAsDocs(opts: {
	as: 'metadataDocs'
	dir: string
	includeExt?: boolean
	recursive: boolean
}): { name: string; doc: Document.Parsed }[]

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
					doc: loadFileAsDoc(normalizePath(obj.path)),
					name: includeExt
						? obj.name
						: obj.name.includes('.')
						? obj.name.substring(0, obj.name.lastIndexOf('.'))
						: obj.name,
			  })
			: (fpath: string) => loadFileAsDoc(fpath)
	return globbySync(normalizePath(dir, recursive ? '**/*.yml' : '*.yml'), {
		objectMode: as === 'metadataDocs',
		onlyFiles: true,
	}).map((fpath) => xform(fpath))
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

// Normalizes the path (compatible with win). Useful for globs to work expectedly
export function normalizePath(...s: string[]) {
	return (s.length > 1 ? path.join(...s) : s[0]).replace(/\\/g, '/')
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

export const withYmlExt = withSuffix('.yml')
export const withEngLocale = withSuffix('_en')

export function withoutExt(str: string) {
	return hasDot(str) ? str.substring(str.lastIndexOf('.')) : str
}

// prettier-ignore
export const withTag = (colorFunc = cyan) => (s: string) => `[${colorFunc(s)}]`
