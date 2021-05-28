import axios from 'axios'
import yaml from 'yaml'
import NOODLObject from '../api/Object'
import { App, Noodl } from '../types'
import { replaceBaseUrlPlaceholder } from '../utils/common'

class AppConfigBuilder
	extends NOODLObject<Noodl.AppConfig>
	implements Noodl.AppConfig {
	#rootConfig = {} as Noodl.RootConfig
	assetsUrl = ''
	baseUrl = ''
	fileSuffix = '.yml'
	server = {} as App.CliConfigObject['server']
	languageSuffix = { en: '_en' }
	preload: string[] = []
	page: string[] = []
	startPage = ''
	initialized = false

	constructor(arg?: any) {
		super(arg)
	}

	get rootConfig() {
		return this.#rootConfig
	}

	set rootConfig(rootConfig) {
		this.#rootConfig = rootConfig
	}

	async build() {
		let appBaseUrl = this.rootConfig.cadlBaseUrl
		appBaseUrl += this.rootConfig.cadlMain
		const { data: yml } = await axios.get(appBaseUrl)
		this.yml = yml
		this.json = yaml.parse(yml) as Noodl.AppConfig
		this.json = Object.entries(this.json).reduce(
			(acc, [key, value]: [string, any]) => {
				acc[key] =
					typeof value === 'string'
						? replaceBaseUrlPlaceholder(value, this.rootConfig.cadlBaseUrl)
						: value

				return acc
			},
			{} as any,
		)
		this.initialized = true
		return this.json as Noodl.AppConfig
	}

	get pages() {
		return this.json?.page
	}

	getPageUrl(pagePath: string) {
		return `${this.json?.baseUrl}${pagePath}`
	}
}

export default AppConfigBuilder
