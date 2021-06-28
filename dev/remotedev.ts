import fs from 'fs-extra'
import path from 'path'
import meow from 'meow'
import mime from 'mime'
import * as r from '../src/utils/remote'

const cli = meow({
	flags: {
		config: { alias: 'c', type: 'string' },
	},
})

const start = async () => {
	try {
		console.log(mime.lookup())
	} catch (error) {
		console.log('EH?')
		throw error
	}
}

start()
