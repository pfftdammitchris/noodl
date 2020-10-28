import { AxiosError } from 'axios'
import chalk from 'chalk'

export const createConfigURL = (function () {
	const _root = 'https://public.aitmed.com'
	const _ext = 'yml'

	return (configKey: string) => {
		return `${_root}/config/${configKey}.${_ext}`
	}
})()

export function prettifyErr(err: AxiosError | Error) {
	if ('response' in err) {
		if (err?.response?.data) {
			return `[${chalk.yellow('AxiosError')}}]: ${err.response.data}`
		}
	}
	return `[${chalk.yellow(err.name)}]: ${chalk.red(err.message)}`
}
