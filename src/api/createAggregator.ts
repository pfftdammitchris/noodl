import axios from 'axios'
import yaml from 'yaml'
import { withSuffix } from '../utils/common'
import { ObjectResult } from '../types'
import RootConfig from '../builders/RootConfig'
import AppConfig from '../builders/AppConfig'

export interface ConfigOptions {
	config?: string
	host?: string
	version?: string | number
}

const createAggregator = function (opts?: ConfigOptions) {
	const api = {
		rootConfig: null as any,
		appConfig: null as any,
	} as { rootConfig: RootConfig; appConfig: AppConfig }

	let config = opts?.config || 'aitmed'
	let host = opts?.host || 'public.aitmed.com'

	const objects = {
		json: {},
		yml: {},
	} as ObjectResult

	const withLocale = withSuffix('_en')
	const withExt = withSuffix('.yml')

	const o = {
		get(ext?: 'json' | 'yml') {
			if (typeof ext === 'string') {
				if (ext === 'json') return objects.json
				if (ext === 'yml') return objects.yml
			}
			return objects
		},
		setConfig(value: string) {
			config = value
			return o
		},
		setHost(value: string) {
			host = value
			return o
		},
		async init(opts?: {
			loadPreloadPages?: boolean
			loadPages?: boolean
			version?: string | number | 'latest'
		}) {
			api.rootConfig = new RootConfig()
			api.appConfig = new AppConfig()
			objects.json[config] = await api.rootConfig
				.setConfig(config)
				.setHost(host)
				.setVersion(opts?.version || 'latest')
				.build()
			objects.yml[config] = objects.json[config]?.yml
			objects.json['cadlEndpoint'] = await api.appConfig
				.setRootConfig(objects.json[config] as any)
				.build()
			objects.yml['cadlEndpoint'] = objects.json.cadlEndpoint.yml
			if (opts?.loadPreloadPages) await o.loadPreloadPages()
			if (opts?.loadPages) await o.loadPages()
			return [objects.json[config], objects.json['cadlEndpoint']]
		},
		async loadPage(name: string, suffix: string = '') {
			try {
				const url = api.appConfig.getPageUrl(name + suffix)
				objects.yml[name] = (await axios.get(url)).data
				objects.json[name] = yaml.parse(objects.yml[name] as string)
				return { json: objects.json[name], yml: objects.yml[name] }
			} catch (error) {
				console.error(error)
				return { json: {}, yml: '' }
			}
		},
		async loadStartPage() {
			return o.loadPage(api.appConfig.startPage, withExt(withLocale('')))
		},
		async loadPreloadPages() {
			const numPages = api.appConfig.preload.length
			for (let index = 0; index < numPages; index++) {
				try {
					const name = api.appConfig.preload[index] as string
					const { json, yml } = await o.loadPage(
						api.appConfig.preload[index] as string,
						withExt(withLocale('')),
					)
					objects.json[name] = json
					objects.yml[name] = yml
				} catch (error) {
					console.error(`[${error.name}]: ${error.message}`)
				}
			}
		},
		async loadPages(opts?: { includePreloadPages?: boolean }) {
			const numPages = api.appConfig.json.page.length
			console.info(numPages)
			console.info(numPages)
			console.info(numPages)
			console.info(numPages)
			if (opts?.includePreloadPages) await o.loadPreloadPages()
			for (let index = 0; index < numPages; index++) {
				try {
					const name = api.appConfig.pages[index] as string
					const { json, yml } = await o.loadPage(
						api.appConfig.json.page[index] as string,
						withExt(withLocale('')),
					)
					objects.json[name] = json
					objects.yml[name] = yml
				} catch (error) {
					console.error(`[${error.name}]: ${error.message}`)
				}
			}
		},
	}

	return o
}

export default createAggregator
