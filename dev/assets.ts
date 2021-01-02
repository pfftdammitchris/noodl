import path from 'path'
import fs from 'fs-extra'
import yaml from 'yaml'
import download from 'download'
import { forEachDeepKeyValue, getFilePath } from '../src/utils/common'

async function getAssets(yml: any) {
	try {
		// const rootConfig = yaml.parse(
		// 	await fs.readFile(getFilePath('./data/objects/yml/testpage.yml'), 'utf8'),
		// )
		const baseUrl =
			'https://s3.us-east-2.amazonaws.com/public.aitmed.com/cadl/testpage0.29/assets/'
		const paths = [] as string[]
		forEachDeepKeyValue((key, value, o) => {
			if (typeof value === 'string') {
				if (/\.(avi|mp4|wmv|jpg|jpeg|png|gif)/i.test(value)) paths.push(value)
			}
		}, yaml.parse(yml))
		return paths.map((p) => {
			return baseUrl + p
		})
	} catch (error) {
		throw new Error(error)
	}
}

getAssets(
	fs.readFileSync(getFilePath('./data/objects/yml/TestRedaw.yml'), 'utf8'),
).then(async (paths) => {
	for (let url of paths) {
		console.log(url)
		await download(url, getFilePath('./data/images'))
	}
})
