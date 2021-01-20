import { DEFAULT_CONFIG_HOSTNAME, DEFAULT_SERVER_PROTOCOL } from '../constants'

export const endpoint = (function () {
	const o = {
		root: DEFAULT_CONFIG_HOSTNAME,
		base: DEFAULT_SERVER_PROTOCOL + DEFAULT_CONFIG_HOSTNAME + '/config',
	}
	return o
})()
