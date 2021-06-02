import axios from 'axios'
import * as c from '../constants'

export async function getConfig(configKey: string) {
	try {
		const { data } = await axios.get(
			`https://${c.DEFAULT_CONFIG_HOSTNAME}/config/${configKey}.yml`,
		)
		return data
	} catch (err) {
		if (err.response) {
			console.log(err.response.data)
			console.log(err.response.status)
			console.log(err.response.headers)
		} else if (err.request) {
			console.log(err.request)
		} else {
			console.log('Error', err.message)
		}
		console.log(err.config)
		throw err
	}
}
