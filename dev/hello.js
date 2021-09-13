import * as u from '@jsmanifest/utils'
import fs from 'fs-extra'
import path from 'path'
import axios from 'axios'

process.env.NODE_ENV = 'development'

const req = axios.create({
	baseURL: 'http://127.0.0.1:8080',
})

async function start() {
	try {
		const resp = await req.get('/admind2/ref', {
			params: {
				// config: 'admind2',
			},
		})
		console.log(resp.data)
	} catch (error) {
		console.error(error)
		u.throwError(error)
	}
}

start()

//
