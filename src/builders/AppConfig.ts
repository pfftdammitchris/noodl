import axios from 'axios'
import yaml from 'yaml'
import { AppConfig, ServerOptions } from '../types'
import NOODLObject from '../api/Object'
import { replaceBaseUrlPlaceholder } from '../utils/common'

class AppConfigBuilder extends NOODLObject implements AppConfig {
	assetsUrl = ''
	baseUrl = ''
	fileSuffix = '.yml'
	server = {} as ServerOptions
	languageSuffix = { en: '_en' }
	preload: string[] = []
	page: string[] = []
	startPage = ''
	rootConfig: any = null

	constructor(arg?: any) {
		super(arg)
	}

	async build() {
		let appBaseUrl = this.rootConfig.cadlBaseUrl
		appBaseUrl += this.rootConfig.cadlMain
		const { data: yml } = await axios.get(appBaseUrl)
		this.yml = yml
		this.json = yaml.parse(yml)
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
		return this.json
	}

	get pages() {
		return this.json.page
	}

	setRootConfig(rootConfig: { [key: string]: any }) {
		this.rootConfig = rootConfig
		return this
	}

	getPageUrl(pagePath: string) {
		return `${this.json.baseUrl}${pagePath}`
	}
}

export default AppConfigBuilder
