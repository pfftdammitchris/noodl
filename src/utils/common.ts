import { AxiosError } from 'axios'
import path from 'path'
import chalk from 'chalk'

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

export function toArray(value: any): any[] {
	return Array.isArray(value) ? value : [value]
}

export const withSuffix = (suffix: string) => (str: string) => `${str}${suffix}`
export const withEngLocale = withSuffix('_en')
export const withJsonExt = withSuffix('.json')
export const withYmlExt = withSuffix('.yml')
