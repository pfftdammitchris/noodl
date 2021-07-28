// @ts-nocheck
import { config } from 'dotenv'
config()
import chalk from 'chalk'
import chunk from 'lodash/chunk'
import xmlParser from 'fast-xml-parser'
import axios from 'axios'
import fs from 'fs-extra'
import prettyBytes from 'pretty-bytes'
import { getAbsFilePath } from '../src/utils/common'

const writeOpts = { spaces: 2 }
const pathToJsonFolder = getAbsFilePath('./data/objects/json/')
const pathToYmlFolder = getAbsFilePath('./data/objects/yml/')
fs.mkdirpSync(pathToJsonFolder)
fs.mkdirpSync(pathToYmlFolder)

function createXmlUtil({
	baseUrl = 'https://s3.us-east-2.amazonaws.com',
	endpoint = 'public.aitmed.com',
}: {
	baseUrl?: string
	endpoint?: string
} = {}) {
	const o = {
		baseUrl,
		endpoint,
		async getS3Objects(): Promise<
			{
				Key: string
				LastModified: string
				ETag: string
				Size: number
				StorageClass: string
			}[]
		> {
			try {
				const { data: xml } = await axios.get(`${`${baseUrl}/${endpoint}`}`, {
					headers: { 'Content-Type': 'application/xml' },
				})
				const { ListBucketResult } = xmlParser.parse(xml)
				return ListBucketResult.Contents
			} catch (error) {
				console.log(`[${chalk.red(error.name)}]: ${error.message}`)
			}
		},
		isKey: (o: any) => o?.name === 'Key',
		isImg: (s: string) => /([a-z\-_0-9\/\:\.]*\.(jpg|jpeg|png|gif))/i.test(s),
		isVid: (s: string) => /([a-z\-_0-9\/\:\.]*\.(mp4|avi|wmv))/i.test(s),
		isYml: (s = '') => s.endsWith('.yml'),
		isJson: (s = '') => s.endsWith('.json'),
		createUrl(pathname: string) {
			return `https://public.aitmed.com/${pathname}`
		},
		formatS3Object(obj: any) {
			return {
				url: o.createUrl(obj.Key),
				modifiedAt: obj.LastModified,
				size: prettyBytes(obj.Size),
			}
		},
	}

	return o
}

async function getS3Data() {
	try {
		const xmlApi = createXmlUtil()

		const store = {
			images: {},
			ymls: {},
			json: {},
			videos: {},
		}

		const chunks = chunk(await xmlApi.getS3Objects(), 5)

		await Promise.all(
			chunks.map((c) =>
				Promise.all(
					c.map((obj) => {
						const item = xmlApi.formatS3Object(obj)
						if (xmlApi.isImg(obj.Key)) {
							store.images[item.url] = item
						} else if (xmlApi.isVid(obj.Key)) {
							store.videos[item.url] = item
						} else if (xmlApi.isYml(obj.Key)) {
							store.ymls[item.url] = item
						} else if (xmlApi.isJson(obj.Key)) {
							store.json[item.url] = item
						}
					}),
				),
			),
		)

		// fs.writeJsonSync(
		// 	getAbsFilePath('./data/results.json'),
		// 	{ timestamp: new Date().toISOString(), ...store },
		// 	{ spaces: 2 },
		// )

		console.log('DONE')
	} catch (error) {
		console.error(error)
	}
}

getS3Data()
