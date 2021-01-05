import { AxiosError } from 'axios'
import isPlainObject from 'lodash/isPlainObject'
import path from 'path'
import chalk from 'chalk'

// chalk helpers
export const highlight = (...s: any[]) => chalk.yellow(...s)
export const italic = (...s: any[]) => chalk.italic(chalk.white(...s))
export const blue = (...s: any[]) => chalk.blue(...s)
export const cyan = (...s: any[]) => chalk.cyan(...s)
export const green = (...s: any[]) => chalk.green(...s)
export const hotpink = (...s: any[]) => chalk.hex('#F65CA1')(...s)
export const magenta = (...s: any[]) => chalk.magenta(...s)
export const orange = (...s: any[]) => chalk.keyword('orange')(...s)
export const deepOrange = (...s: any[]) => chalk.hex('#FF8B3F')(...s)
export const red = (...s: any[]) => chalk.red(...s)

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

export function entriesDeepKeyValue(cb, obj) {
	const result = {}
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
	return path.resolve(path.join(process.cwd(), ...paths))
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

export function sortObjPropsByKeys(obj: { [key: string]: any }) {
	return Object.entries(obj)
		.sort((a, b) => {
			if (a[1] > b[1]) return -1
			if (a[1] === b[1]) return 0
			return 1
		})
		.reduce((acc, [key, value]) => Object.assign(acc, { [key]: value }), {})
}

export const withSuffix = (suffix: string) => (str: string) => `${str}${suffix}`
export const withEngLocale = withSuffix('_en')
export const withJsonExt = withSuffix('.json')
export const withYmlExt = withSuffix('.yml')
