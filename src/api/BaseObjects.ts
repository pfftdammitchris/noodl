import { AppConfig, IBaseObjects, RootConfig } from '../types'
import Objects from './Objects'

export interface BasesOptions {
	endpoint?: string
	json?: boolean
	yml?: boolean
}

class BaseObjects extends Objects implements IBaseObjects {
	#endpoint: string = ''
	#onRootConfig?: (config: { json: RootConfig; yml?: string }) => void
	#onAppConfig?: <Config extends {} = any>(config: {
		json: Config
		yml?: string
	}) => void
	#onVersion?: (version: string) => void
	#onBaseUrl?: (baseUrl: string) => void
	#onAppEndpoint?: (endpoint: string) => void
	#onAppBaseUrl?: (baseUrl: string) => void
	baseUrl: string = ''
	appEndpoint: string = ''
	appBaseUrl: string = ''
	version: string = ''

	constructor() {
		super('BaseObjects')
	}

	async init() {
		// Load/save root config in memory
		const rootConfigResult = await this.load<RootConfig>(
			'rootConfig',
			this.endpoint,
		)
		this.onRootConfig?.(rootConfigResult)

		const noodlConfigResult = await this.load<AppConfig>(
			'appConfig',
			this.appEndpoint,
		)
		this.onAppConfig?.<AppConfig>(noodlConfigResult)

		const { json: rootConfig } = rootConfigResult
		const { json: appConfig } = noodlConfigResult

		// Set version, root baseUrl
		this['version'] = this.getLatestVersion()
		this.onVersion?.(this.version)

		this['baseUrl'] = rootConfig.cadlBaseUrl.replace(
			'${cadlVersion}',
			this.version,
		)
		this.onBaseUrl?.(this.baseUrl)

		// Set noodl config, endpoint, baseUrl
		this['appEndpoint'] = `${this.baseUrl}${rootConfig.cadlMain}`
		this.onAppEndpoint?.(this.appEndpoint)

		this['appBaseUrl'] = appConfig.baseUrl.replace(
			'${cadlBaseUrl}',
			this.baseUrl,
		)
		this.onAppBaseUrl?.(this.appBaseUrl)

		const preloadPages = appConfig.preload || []
		const numPages = preloadPages.length

		if (preloadPages.length) {
			for (let index = 0; index < numPages; index++) {
				const pageName = preloadPages[index]
				const pageUrl = `${this.appBaseUrl}${pageName}_en.yml`
				await this.load(pageName, pageUrl)
			}
		}

		return Object.entries(this.objects).reduce(
			(acc, [key, value]) => Object.assign(acc, { [key]: value.json }),
			{},
		)
	}

	get rootConfig() {
		return this.objects.rootConfig?.json || null
	}

	get appConfig() {
		return this.objects.appConfig?.json || null
	}

	get endpoint() {
		return this.#endpoint
	}

	set endpoint(endpoint: string) {
		this.#endpoint = endpoint
	}

	getLatestVersion(rootConfig = this.rootConfig.json) {
		// TODO - Support any shaped config
		return rootConfig?.web?.cadlVersion?.test || rootConfig?.versionNumber
	}

	get onRootConfig() {
		return this.#onRootConfig
	}

	set onRootConfig(fn) {
		this.#onRootConfig = fn
	}

	get onAppConfig() {
		return this.#onAppConfig
	}

	set onAppConfig(fn) {
		this.#onAppConfig = fn
	}

	get onVersion() {
		return this.#onVersion
	}

	get onBaseUrl() {
		return this.#onBaseUrl
	}

	get onAppEndpoint() {
		return this.#onAppEndpoint
	}

	get onAppBaseUrl() {
		return this.#onAppBaseUrl
	}
}

export default BaseObjects
