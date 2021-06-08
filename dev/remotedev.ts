import fs from 'fs-extra'
import path from 'path'
import meow from 'meow'
import * as r from '../src/utils/remote'

const cli = meow({
	flags: {
		config: { alias: 'c', type: 'string' },
	},
})

const start = async () => {
	try {
		const result = await r.configExists('testpage2')
		console.log(result)
	} catch (error) {
		console.log('EH?')
		throw error
	}
}

start()
