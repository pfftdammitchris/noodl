import chalk from 'chalk'
import isPlo from 'lodash/isPlainObject'
import xmljs from 'xml-js'
import axios from 'axios'
import fs from 'fs-extra'
import { getFilePath } from '../src/utils/common'

const writeOpts = { spaces: 2 }
const pathToJsonFolder = getFilePath('./data/objects/json/')
const pathToYmlFolder = getFilePath('./data/objects/yml/')
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
		async loadXML() {
			try {
				const { data: xml } = await axios.get(`${`${baseUrl}/${endpoint}`}`, {
					headers: { 'Content-Type': 'application/xml' },
				})
				return xmljs.xml2js(xml)
			} catch (error) {
				console.log(`[${chalk.red(error.name)}]: ${error.message}`)
			}
		},
		isKey: (o: any) => o?.name === 'Key',
		isImg: (s: string) => /([a-z\-_0-9\/\:\.]*\.(jpg|jpeg|png|gif))/i.test(s),
		isVid: (s: string) => /([a-z\-_0-9\/\:\.]*\.(mp4|avi|wmv))/i.test(s),
		isYml: (s: string = '') => s.endsWith('.yml'),
		isLastModifiedDate: (o: any) => isPlo(o) && o.name === 'LastModified',
		walkXmlNodes(
			xmlElem: xmljs.Element | xmljs.ElementCompact,
			cb: (elem: xmljs.Element | xmljs.ElementCompact) => void,
		) {
			if (Array.isArray(xmlElem?.elements)) {
				xmlElem.elements.forEach((_o) => {
					cb(_o)
					o.walkXmlNodes(_o, cb)
				})
			}
			cb(xmlElem)
		},
	}

	return o
}

async function getS3Data() {
	try {
		const xmlApi = createXmlUtil()
		const xmlElem = await xmlApi.loadXML()

		let text = ''
		let total = 0

		const store = {
			images: {},
			ymls: {},
			videos: {},
		}

		const insert = (text: string, type: string) => {
			const endpoint = text.substring(0, text.lastIndexOf('/'))
			const slice = store[type]
			const url = `${xmlApi.baseUrl}${xmlApi.endpoint}/${text}`
			if (!Array.isArray(slice[endpoint])) slice[endpoint] = []
			if (!slice[endpoint].includes(url)) slice[endpoint].push(url)
		}

		xmlApi.walkXmlNodes(xmlElem, (result) => {
			if (result) {
				total++
				if (xmlApi.isKey) {
					result?.elements?.forEach?.((o) => {
						text = o.text
						if (xmlApi.isYml(text)) {
							console.log(chalk.yellow(`[${total}] YML: ${text}`))
							insert(text, 'ymls')
						} else if (xmlApi.isImg(text)) {
							insert(text, 'images')
							console.log(chalk.yellow(`[${total}] IMG: ${text}`))
						} else if (xmlApi.isVid(text)) {
							insert(text, 'videos')
							console.log(chalk.yellow(`[${total}] VID: ${text}`))
						}
					})
				}
			}
		})

		fs.writeJsonSync(
			getFilePath('./data/xml.json'),
			{ timestamp: new Date().toISOString(), ...store },
			{ spaces: 2 },
		)

		console.log('DONE')
	} catch (error) {
		console.error(error)
	}
}
