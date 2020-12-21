import { DEFAULT_BASE_URL } from '../constants'

export const endpoint = (function () {
	const o = {
		root: DEFAULT_BASE_URL,
		base: DEFAULT_BASE_URL + '/config',
	}
	return o
})()
