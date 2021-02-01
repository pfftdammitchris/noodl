import curry from 'lodash/curry'
import { AxiosError } from 'axios'
import fs from 'fs-extra'
import isPlainObject from 'lodash/isPlainObject'
import path from 'path'
import chalk from 'chalk'
import yaml from 'yaml'
import { Pair, Scalar, YAMLMap, YAMLSeq } from 'yaml/types'
import globby from 'globby'
import { CLIConfigObject, PlainObject } from '../types'

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
		} else if (str && typeof str === 'object') {
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
		// @ts-expect-error
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

export function getFilePath(...paths: string[]) {
	return path.normalize(path.resolve(path.join(process.cwd(), ...paths)))
}

export function getCliConfig() {
	return yaml.parse(getFilePath('noodl.yml')) as CLIConfigObject
}

export function groupAssets(urls: string[]) {
	return urls.reduce(
		(acc, url) => {
			if (isImg(url)) acc.images.push(url)
			else if (isVid(url)) acc.videos.push(url)
			else if (isPdf(url)) acc.pdfs.push(url)
			else acc.other.push(url)
			return acc
		},
		{
			images: [] as string[],
			other: [] as string[],
			pdfs: [] as string[],
			videos: [] as string[],
		},
	)
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
	onFile?(args: { file: PlainObject; filename: string }): void
}): PlainObject[]
export function loadFiles({
	dir,
	ext = 'json',
	onFile,
}: {
	dir: string
	ext?: 'json' | 'yml'
	onFile?(args: { file?: PlainObject | yaml.Document; filename: string }): void
}) {
	return globby
		.sync(path.resolve(getFilePath(dir), `**/*.${ext}`))
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
	return /([a-z\-_0-9\/\:\.]*\.(jpg|jpeg|png|gif))/i.test(s)
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

export function onYAMLMap(fn: (node: YAMLMap) => any) {
	return (v: unknown): v is YAMLMap => (isYAMLMap(v) ? fn(v) : false)
}

export function onYAMLSeq(fn: (node: YAMLSeq) => any) {
	return (v: unknown): v is YAMLSeq => (isYAMLSeq(v) ? fn(v) : false)
}

export function onPair(fn: (node: Pair) => any) {
	return (v: unknown): v is Pair => (isPair(v) ? fn(v) : false)
}

export function onScalar(fn: (node: Scalar) => any) {
	return (v: unknown): v is Scalar => (isScalar(v) ? fn(v) : false)
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
			contents.items.forEach((pair) => walk(pair))
		} else if (contents instanceof YAMLSeq) {
			contents.items.forEach((node) => {
				walk(node)
			})
		}
	}
	const numDocs = docsList.length
	for (let index = 0; index < numDocs; index++) {
		walk(docsList[index]?.contents)
	}
}

export const withSuffix = (suffix: string) => (str: string) => `${str}${suffix}`
export const withEngLocale = withSuffix('_en')
export const withJsonExt = withSuffix('.json')
export const withYmlExt = withSuffix('.yml')
