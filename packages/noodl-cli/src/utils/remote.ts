import * as u from '@jsmanifest/utils'
import axios, { AxiosError, AxiosResponse } from 'axios'
import xmlParser from 'fast-xml-parser'
import * as c from '../constants.js'

// Note: this function does not throw. It returns the Error object instead
export async function configExists(configKey: string) {
	return s3FileExists(
		`https://${c.DEFAULT_CONFIG_HOSTNAME}/config/${configKey}.yml`,
	)
}

export async function getConfig(configKey: string) {
	try {
		const { data } = await axios.get(
			`https://${c.DEFAULT_CONFIG_HOSTNAME}/config/${configKey}.yml`,
		)
		return data
	} catch (err) {
		if (err instanceof Error) {
			const error = err as AxiosError
			if (error.response) {
				console.log(error.response.data)
				console.log(error.response.status)
				console.log(error.response.headers)
			} else if (error.request) {
				console.log(error.request)
			} else {
				console.log('Error', err.message)
			}
			console.log(error.config)
		}

		throw err
	}
}

// Note: this function does not throw. It returns the Error object instead
export async function s3FileExists(
	url: string,
): Promise<boolean | Error | undefined> {
	try {
		await axios.get(url)
		return true
	} catch (error) {
		const res: AxiosError['response'] = (error as AxiosError).response
		if (res) {
			// if (u.isNum(res.status)) return res.status !== 404
			if (u.isStr(res.data)) {
				const xmlData = res.data.trim()
				if (xmlData.startsWith('<?xml')) {
					const err = xmlParser.parse(xmlData, { allowBooleanAttributes: true })
					if (u.isObj(err) && err.Error) {
						return (
							err.Error.code !== 'NoSuchKey' &&
							!/does not exist/i.test(err.Error.Message || '')
						)
					}
				}
			}
		}
		return error instanceof Error ? error : new Error(String(error))
	}
}
