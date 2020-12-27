import axios from 'axios'
import chalk from 'chalk'
import fs from 'fs-extra'
import path from 'path'
import globby from 'globby'
import { getFilePath } from '../src/utils/common'
import createAggregator from '../src/api/createAggregator'

async function forEachDeepFile(
	dir: string,
	fn: (file: fs.Dirent) => Promise<void> | void,
) {
	try {
		let dirFiles = await fs.readdir(dir, {
			encoding: 'utf8',
			withFileTypes: true,
		})
		for (let file of dirFiles) {
			fn(file)
			if (file.isDirectory()) {
				await forEachDeepFile(path.join(dir, file.name), fn)
			}
		}
	} catch (error) {
		console.error(error)
	}
}

async function getFilesDeep(opts: { dir: string }) {
	try {
	} catch (error) {
		console.error(`[${chalk.red(error.name)}]: ${error.message}`)
	}
}

let count = 0
// forEachDeepFile('data/objects', (file) => {
// 	console.log(file)
// 	count++
// })
// console.log(count)

globby(['.png']).then(console.log).catch(console.error)
