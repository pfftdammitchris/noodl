import { Log } from '../types'

export const divider =
	'----------------------------------------------------------------------'

const log =
	process.env.NODE_ENV === 'production'
		? Object.create(console.log)
		: (console.log as Log)

Object.defineProperties(log, {
	attention: {
		value(msg?: string) {
			log.blank()
			console.log(divider)
			console.log(msg || '')
			console.log(divider)
			log.blank()
			return log
		},
	},
	blank: {
		value() {
			console.log('')
			return log
		},
	},
})

export default log
