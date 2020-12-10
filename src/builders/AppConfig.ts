import axios from 'axios'
import yaml from 'yaml'
import NOODLObject from '../api/NOODLObject'

class AppConfigBuilder extends NOODLObject {
	rootConfig: any = null

	constructor(arg?: any) {
		super(arg)
	}

	async build() {
		let appBaseUrl = this.rootConfig.cadlBaseUrl
		appBaseUrl += this.rootConfig.cadlMain
		console.log(this.rootConfig)
		const { data: yml } = await axios.get(appBaseUrl)
		this.yml = yml
		this.json = yaml.parse(yml)
		this.json = Object.entries(this.json).reduce(
			(acc, [key, value]: [string, any]) => {
				acc[key] =
					typeof value === 'string'
						? this.#replaceBaseUrlPlaceholder(
								value,
								this.rootConfig.cadlBaseUrl,
						  )
						: value
				return acc
			},
			{} as any,
		)
		return this.json
	}

	setRootConfig(rootConfig: { [key: string]: any }) {
		this.rootConfig = rootConfig
		return this
	}

	#replaceBaseUrlPlaceholder = (str: string, value: any) =>
		str.replace(/\${cadlBaseUrl}/gi, String(value))
}

export default AppConfigBuilder
