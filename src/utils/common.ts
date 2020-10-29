import { AxiosError } from 'axios'
import chalk from 'chalk'

export const createConfigURL = (function () {
	const _root = 'https://public.aitmed.com'
	const _ext = 'yml'

	return (configKey: string) => {
		return `${_root}/config/${configKey}.${_ext}`
	}
})()

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

export const replaceBaseUrlPlaceholder = createPlaceholderReplacer(
	'\\${cadlBaseUrl}',
	'g',
)

export const replaceVersionPlaceholder = createPlaceholderReplacer(
	'\\${cadlVersion}',
	'g',
)

export function replacePlaceholders(obj: any, placeholder: string, value: any) {
	const result = {}
	let current
	const entries = Object.entries(obj)
	const numEntries = entries.length
	for (let index = 0; index < numEntries; index++) {
		const [key, v] = entries[index]
		current = v
		if (Array.isArray(current)) {
			result[key] = current.reduce((acc, item) => {
				acc.push(replacePlaceholders(item, placeholder, value))
				return acc
			}, [])
		} else if (current && typeof current === 'object') {
			result[key] = replacePlaceholders(current, placeholder, value)
		} else {
			result[key] = v
		}
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
