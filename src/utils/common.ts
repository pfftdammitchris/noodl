import { AxiosError } from 'axios'
import chalk from 'chalk'

export const createConfigURL = (function () {
	const _root = 'https://public.aitmed.com'
	const _ext = 'yml'

	return (configKey: string) => {
		return `${_root}/config/${configKey}.${_ext}`
	}
})()

export function createPlaceholderReplacer(placeholder: string) {
	return (str: string, value: string | number) => {
		return str.replace(placeholder, String(value))
	}
}

export const replaceBaseUrlPlaceholder = createPlaceholderReplacer(
	'${cadlBaseUrl}',
)

export const replaceVersionPlaceholder = createPlaceholderReplacer(
	'${cadlVersion}',
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
