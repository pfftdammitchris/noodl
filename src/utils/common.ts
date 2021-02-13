import curry from 'lodash/curry'
import fs from 'fs-extra'
import isPlainObject from 'lodash/isPlainObject'
import path from 'path'
import chalk from 'chalk'
import yaml from 'yaml'
import globby from 'globby'
import { AxiosError } from 'axios'
import { Pair, Scalar, YAMLMap, YAMLSeq } from 'yaml/types'
import {
	MetadataObject,
	GroupedMetadataObjects,
} from '../panels/ServerFiles/types'
import * as T from '../types'
import { URL } from 'url'

// chalk helpers
export const captioning = (...s: any[]) => chalk.hex('#40E09F')(...s)
export const highlight = (...s: any[]) => chalk.yellow(...s)
export const italic = (...s: any[]) => chalk.italic(chalk.white(...s))
export const blue = (...s: any[]) => chalk.blue(...s)
export const cyan = (...s: any[]) => chalk.cyan(...s)
export const green = (...s: any[]) => chalk.green(...s)
export const hotpink = (...s: any[]) => chalk.hex('#F65CA1')(...s)
export const magenta = (...s: any[]) => chalk.magenta(...s)
export const orange = (...s: any[]) => chalk.keyword('orange')(...s)
export const deepOrange = (...s: any[]) => chalk.hex('#FF8B3F')(...s)
export const red = (...s: any[]) => chalk.redBright(...s)
export const white = (...s: any[]) => chalk.whiteBright(...s)
export const yellow = (...s: any[]) => chalk.yellow(...s)
export const newline = () => console.log('')

export function createGroupedMetadataObjects(
	init?: Partial<GroupedMetadataObjects>,
): GroupedMetadataObjects & {} {
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
		(Array.isArray(placeholders) ? placeholders : [placeholders]).reduce(
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
		if (typeof str === 'string') {
			return str.replace(regexp, String(value))
		} else if (isPlainObject(str)) {
			const stringified = JSON.stringify(str).replace(regexp, String(value))
			return JSON.parse(stringified)
		}
		return ''
	}
	return replace
}

export function entriesDeepKeyValue(cb: any, obj: any) {
	const result = {} as any
	if (Array.isArray(obj)) {
		obj.forEach((o) => Object.assign(result, entriesDeepKeyValue(cb, o)))
	} else if (isPlainObject(obj)) {
		Object.entries(obj).forEach(([key, value], index, collection) => {
			result[key] = cb(key, value, collection) || {}
			if (isPlainObject(value)) {
				Object.assign(result[key], entriesDeepKeyValue(cb, value))
			}
		}, {})
	}
	return result
}

/**
 * Resolves an array of promises safely, inserting each result to the list
 * including errors that occurred inbetween.
 * @param { Promise[] } promises - Array of promises
 */
export async function promiseAllSafe(...promises: Promise<any>[]) {
	const results = []
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

/**
 * This function is like promiseAllSafe except that it returns a tuple,
 * where the first index is an array of passed promises and the second is
 * an array of any error objects that occurred
 * @param { Promise[] } promises
 */
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

/**
 * Recursively traverses each key/value, calling the callback on each iteration
 * @param { function } fn - Callback function
 * @param { object | array } obj
 */
export function forEachDeepKeyValue<O = any>(
	cb: (key: string, value: any, obj: { [key: string]: any }) => void,
	obj: O | O[],
) {
	if (Array.isArray(obj)) {
		obj.forEach((v) => forEachDeepKeyValue(cb, v))
	} else if (isPlainObject(obj)) {
		Object.entries(obj).forEach(([key, value]) => {
			cb(key, value, obj)
			if (isPlainObject(value) || Array.isArray(value)) {
				forEachDeepKeyValue(cb, value)
			}
		})
	}
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

export function getFilepath(...paths: string[]) {
	return path.normalize(path.resolve(path.join(process.cwd(), ...paths)))
}

export function getCliConfig() {
	return yaml.parse(
		fs.readFileSync(getFilepath('noodl.yml'), 'utf8'),
	) as T.CliConfigObject
}

export function createMetadataExtractor(type: 'filepath' | 'link') {
	type GetMetadataObjectArgsObject = Partial<{ [K in typeof type]: string }> & {
		baseUrl?: string
		prefix?: string
		tilde?: string
	}

	function getMetadataObject(args: GetMetadataObjectArgsObject): MetadataObject
	function getMetadataObject(str: string): MetadataObject
	function getMetadataObject(s: GetMetadataObjectArgsObject | string) {
		const metadata = {} as MetadataObject

		let value = (typeof s === 'string' ? s : s[type]) as string

		metadata.raw = value as string
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
				metadata.filepath = getFilepath(value)
			}
		} else {
			if (type === 'link') {
				const { baseUrl = '', prefix = '', tilde } = s
				metadata.link = baseUrl
				prefix && (metadata.link += `${prefix}`)
				metadata.link += metadata.pathname.startsWith('/')
					? metadata.pathname
					: `/${metadata.pathname}`
			} else {
				metadata.filepath = s.prefix
					? getFilepath(path.join(s.prefix, s[type] as string))
					: getFilepath(s[type] as string)
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

/**
 * Expects a list of URLs and groups them according to their file type
 * This can also expect values from the "path" in noodl objects as well
 * as file paths
 * @param { string[] } urls
 */
export function groupAssetUrls(urls: string[]) {
	return urls.reduce(
		(acc, url) => {
			if (isImg(url)) acc.images.push(url)
			else if (isVid(url)) acc.videos.push(url)
			else if (isPdf(url)) acc.documents.push(url)
			else if (isJs(url) || isHtml(url)) acc.scripts.push(url)
			return acc
		},
		{
			images: [] as string[],
			documents: [] as string[],
			scripts: [] as string[],
			videos: [] as string[],
		},
	)
}

export function hasDot(s: string) {
	return !!s?.includes('.')
}

export function hasSlash(s: string) {
	return !!s?.includes('/')
}

export function hasCliConfig() {
	return fs.existsSync(getFilepath('noodl.yml'))
}

export function hasAllKeys(keys: string | string[]) {
	return (node: YAMLMap) =>
		(Array.isArray(keys) ? keys : [keys]).every((key) => node.has(key))
}

export function hasAnyKeys(keys: string | string[]) {
	return (node: YAMLMap) =>
		(Array.isArray(keys) ? keys : [keys]).some((key) => node.has(key))
}

export function hasKey(key: string) {
	return (node: YAMLMap) => node.has(key)
}

export function hasKeyEqualTo(key: string, value: any) {
	return (node: YAMLMap) => node.has(key) && node.get(key) === value
}

export function loadFiles(opts: {
	dir: string
	ext: 'yml'
	onFile?(args: { file: yaml.Document; filename: string }): void
}): yaml.Document[]
export function loadFiles(opts: {
	dir: string
	ext: 'json'
	onFile?(args: { file: T.PlainObject; filename: string }): void
}): T.PlainObject[]
export function loadFiles({
	dir,
	ext = 'json',
	onFile,
}: {
	dir: string
	ext?: 'json' | 'yml'
	onFile?(args: {
		file?: T.PlainObject | yaml.Document
		filename: string
	}): void
}) {
	return globby
		.sync(path.resolve(getFilepath(dir), `**/*.${ext}`))
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

export function isYAMLMap(v: unknown): v is YAMLMap {
	return v instanceof YAMLMap
}

export function isYAMLSeq(v: unknown): v is YAMLSeq {
	return v instanceof YAMLSeq
}

export function isPair(v: unknown): v is Pair {
	return v instanceof Pair
}

export function isScalar(v: unknown): v is Scalar {
	return v instanceof Scalar
}

export function onYAMLMap(fn: T.IdentifyFn<YAMLMap>) {
	return function (v: unknown) {
		return isYAMLMap(v) && fn(v)
	}
}

export function onYAMLSeq(fn: T.IdentifyFn<YAMLSeq>) {
	return function (v: unknown) {
		return isYAMLSeq(v) && fn(v)
	}
}

export function onPair(fn: T.IdentifyFn<Pair>) {
	return function (v: unknown) {
		return isPair(v) && fn(v)
	}
}

export function onScalar(fn: T.IdentifyFn<Scalar>) {
	return function (v: unknown) {
		return isScalar(v) && fn(v)
	}
}

export function prettifyErr(err: AxiosError | Error) {
	if ('response' in err) {
		if (err?.response?.data) {
			return `[${chalk.yellow('AxiosError')}}]: ${err.response.data}`
		}
	}
	return `[${chalk.yellow(err.name)}]: ${chalk.red(err.message)}`
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
	return Object.entries(obj)
		.sort((a, b) => {
			if (a[1] > b[1]) return -1
			if (a[1] === b[1]) return 0
			return 1
		})
		.reduce((acc, [key, value]) => Object.assign(acc, { [key]: value }), {})
}

export function traverse(
	cb: (node: Scalar | Pair | YAMLMap | YAMLSeq) => void,
	docsList: yaml.Document | yaml.Document[],
) {
	docsList = Array.isArray(docsList) ? docsList : [docsList]
	const walk = (contents: Scalar | Pair | YAMLMap | YAMLSeq) => {
		if (contents instanceof Scalar) {
			cb(contents)
		} else if (contents instanceof Pair) {
			cb(contents)
			walk(contents.value)
		} else if (contents instanceof YAMLMap) {
			cb(contents)
			contents.items.forEach(walk)
		} else if (contents instanceof YAMLSeq) {
			contents.items.forEach(walk)
		}
	}
	const numDocs = docsList.length
	for (let index = 0; index < numDocs; index++) {
		walk(docsList[index]?.contents)
	}
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
