import axios from 'axios'
import yaml from 'yaml'
import NOODLObject from '../api/Object'
import { Noodl } from '../types'
import {
	replaceDesignSuffixPlaceholder,
	replaceVersionPlaceholder,
	withSuffix,
} from '../utils/common'

class RootConfigBuilder
	extends NOODLObject<Noodl.RootConfig>
	implements Noodl.RootConfig {
	#id = 'aitmed'
	#hostname: string = 'public.aitmed.com'
	#protocol = 'https'
	apiHost = ''
	apiPort = ''
	webApiHost: string = ''
	appApiHost: string = ''
	cadlBaseUrl = ''
	connectiontimeout: string = ''
	loadingLevel: number = 0
	cadlMain = ''
	debug: string = ''
	version: string | number = ''
	versionNumber: number = 0

	static parsePlaceholders(rootConfig: any) {
		if (!rootConfig) return rootConfig
		return Object.entries(rootConfig).reduce(
			(acc, [key, value]: [string, any]) => {
				acc[key] =
					typeof value === 'string'
						? replaceVersionPlaceholder(
								replaceDesignSuffixPlaceholder(value, ''),
								String(
									rootConfig?.web?.cadlVersion?.test ||
										rootConfig?.versionNumber,
								),
						  )
						: value
				return acc
			},
			{} as any,
		)
	}

	constructor(arg?: any) {
		super(arg)
	}

	get id() {
		return this.#id
	}

	set id(id) {
		this.#id = id
	}

	async build() {
		const withExt = withSuffix('.yml')
		let baseUrl = this.#protocol + '://'
		baseUrl += this.#hostname + '/config'
		baseUrl += '/'
		baseUrl += withExt(this.id)

		try {
			this.yml = (await axios.get(baseUrl)).data
		} catch (error) {
			const urlArr = baseUrl.split('/')
			urlArr.pop()
			this.yml = (await axios.get(`${urlArr.join('/')}/aitmed.yml`)).data
		}

		this.json = yaml.parse(this.yml)
		this.json = RootConfigBuilder.parsePlaceholders(this.json)
		return (this.json || {}) as Noodl.RootConfig
	}
}

export default RootConfigBuilder
