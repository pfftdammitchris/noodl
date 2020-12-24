import axios from 'axios'
import yaml from 'yaml'
import NOODLObject from '../api/NOODLObject'
import { replaceBaseUrlPlaceholder } from '../utils/common'

class AppConfigBuilder extends NOODLObject {
	rootConfig: any = null
	assetsUrl = ''
	baseUrl = ''
	startPage = ''
	preload: string[] = []

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
