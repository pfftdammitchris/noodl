import axios from 'axios'
import yaml from 'yaml'
import { RootConfig } from '../types'
import NOODLObject from '../api/Object'
import { withSuffix } from '../utils/common'

class RootConfigBuilder extends NOODLObject implements RootConfig {
	#defaultConfig = 'aitmed'
	#protocol = 'https'
	#hostname: string = 'public.aitmed.com'
	apiHost = ''
	apiPort = ''
	webApiHost: string = ''
	appApiHost: string = ''
	cadlBaseUrl = ''
	connectiontimeout: string = ''
	loadingLevel: number = 0
	cadlMain = ''
	config = ''
	debug: string = ''
	version: string | number = ''
	versionNumber: number = 0

	constructor(arg?: any) {
		super(arg)
	}

	async build() {
		const withExt = withSuffix('.yml')
		let baseUrl = this.#protocol + '://'
		baseUrl += this.#hostname + '/config'
		baseUrl += '/'
		baseUrl += withExt(this.config || this.#defaultConfig)

		try {
			this.yml = (await axios.get(baseUrl)).data
		} catch (error) {
			const urlArr = baseUrl.split('/')
			urlArr.pop()
			this.yml = (await axios.get(`${urlArr.join('/')}/aitmed.yml`)).data
		}

		this.json = yaml.parse(this.yml)
		this.json = Object.entries(this.json || {}).reduce(
			(acc, [key, value]: [string, any]) => {
				acc[key] =
					typeof value === 'string'
						? this.#replaceVersionPlaceholder(
								this.#replaceDesignSuffixPlaceholder(value, ''),
								this.version,
						  )
						: value
				return acc
			},
			{} as any,
		)
		return this.json || {}
	}

	setProtocol(protocol: string) {
		this.#protocol = protocol
		return this
	}

	setHost(hostname: string = 'public.aitmed.com') {
		this.#hostname = hostname
		return this
	}

	setConfigId(configName: string) {
		this.config = configName
		return this
	}

	setVersion(version: string | number) {
		this.version = version
		return this
	}

	#replaceDesignSuffixPlaceholder = (str: string, value: any) =>
		str.replace(/\${designSuffix}/gi, String(value))

	#replaceVersionPlaceholder = (str: string, value: any) => {
		if (value === 'latest') {
			this.version = value =
				this.json.web?.cadlVersion?.test || this.json.version
		}
		return str.replace(/\${cadlVersion}/gi, String(value))
	}
}

export default RootConfigBuilder
