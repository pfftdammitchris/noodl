import axios, { AxiosError } from 'axios'
import xmlParser from 'fast-xml-parser'
import * as c from '../constants'

export async function getConfig(
	configKey: string,
	opts?: { as?: 'json' | 'doc' },
) {
	try {
		const { data } = await axios.get(
			`https://${c.DEFAULT_CONFIG_HOSTNAME}/config/${configKey}.yml`,
		)
		return data
	} catch (err) {
		// console.error(err)
		if (err.response) {
			// The request was made and the server responded
			console.log(err.response.data)
			console.log(err.response.status)
			console.log(err.response.headers)
		} else if (err.request) {
			// The request was made but no response was received
			// `err.request` is an instance of XMLHttpRequest in the browser and an instance of
			// http.ClientRequest in node.js
			console.log(err.request)
		} else {
			// Something happened in setting up the request that triggered an Error
			console.log('Error', err.message)
		}
		console.log(err.config)
		throw err
	}
}
