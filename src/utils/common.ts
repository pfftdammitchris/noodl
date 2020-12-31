import { AxiosError } from 'axios'
import path from 'path'
import chalk from 'chalk'

// chalk helpers
export const highlight = (...s: any[]) => chalk.yellow(...s)
export const italic = (...s: any[]) => chalk.italic(chalk.white(...s))
export const magenta = (...s: any[]) => chalk.magenta(...s)
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

/**
 * Recursively traverses each key/value, calling the callback on each iteration
 * @param { function } fn - Callback function
 * @param { object | array } obj
 */
export function forEachDeepKeyValue(
	fn: (key: string, value: any, obj: any) => void,
	obj: any,
) {
	if (Array.isArray(obj)) {
		obj.forEach((o) => forEachDeepKeyValue(fn, o))
	} else if (obj && typeof obj === 'object') {
		Object.entries(obj).forEach(([key, value]) => {
			fn(key, value, obj)
			if (value) forEachDeepKeyValue(fn, value)
		})
	}
}

export function getFilePath(...paths: string[]) {
	return path.resolve(path.join(process.cwd(), ...paths))
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
