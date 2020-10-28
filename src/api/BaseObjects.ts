import { AppConfig, RootConfig } from '../types'
import Objects from './Objects'
// import { ParseModeObject } from

export interface BasesOptions {
	endpoint?: string
	json?: boolean
	yml?: boolean
}

class BaseObjects extends Objects {
	#endpoint: string = ''
	baseUrl: string = ''
	noodlEndpoint: string = ''
	noodlBaseUrl: string = ''
	version: string = ''

	constructor() {
		super('BaseObjects')
	}

	async init() {
		// Load/save root config in memory
		const rootConfig = (await this.load('rootConfig', this.endpoint))
			?.json as RootConfig
		let noodlConfig = (await this.load('noodlConfig', this.noodlEndpoint)
			?.json) as NoodlConfig
		// Set version, root baseUrl
		this['version'] = this.getLatestVersion()
		this['baseUrl'] = rootConfig.cadlBaseUrl.replace(
			'${cadlVersion}',
			this.version,
		)
		this.onRootConfig?.()
		// Set noodl config, endpoint, baseUrl
		this['noodlEndpoint'] = `${this.baseUrl}${rootConfig.cadlMain}`
		this['noodlBaseUrl'] = items.noodlConfig.json.baseUrl.replace(
			'${cadlBaseUrl}',
			this.baseUrl,
		)
		this.onNoodlConfig?.()
		if (includeBasePages) {
			const numPreloadingPages = this.noodlConfig.json.preload?.length || 0
			for (let index = 0; index < numPreloadingPages; index++) {
				const name = this.noodlConfig.json.preload?.[index]
				const url = `${this.noodlBaseUrl}${name}_en.yml`
				await this.#helper.loadNoodlObject({ url, name })
			}
			this.onBaseItems?.()
		}
		return {
			rootConfig: this.rootConfig.json,
			noodlConfig: noodlConfig.json,
			...this.#helper.items,
		}
	}

	get rootConfig() {
		return this.#helper.items.rootConfig
	}

	get noodlConfig() {
		return this.#helper.items.noodlConfig
	}

	get endpoint() {
		return this.#endpoint
	}

	set endpoint(endpoint: string) {
		this.#endpoint = endpoint
	}

	get objects() {
		return this.#api.objects
	}

	getLatestVersion(rootConfig = this.rootConfig.json) {
		// TODO - Support any shaped config
		return rootConfig?.web?.cadlVersion?.test || rootConfig?.versionNumber
	}

	getRootConfig() {
		return this.rootConfig.json
	}

	getNoodlConfig() {
		return this.noodlConfig.json
	}

	get onRootConfig() {
		return this.#onRootConfig
	}

	get onNoodlConfig() {
		return this.#onNoodlConfig
	}

	get onBaseItems() {
		return this.#onBaseItems
	}

	set onRootConfig(fn: () => any) {
		this.#onRootConfig = fn
	}

	set onNoodlConfig(fn: () => any) {
		this.#onNoodlConfig = fn
	}

	set onBaseItems(fn: () => any) {
		this.#onBaseItems = fn
	}
}

export default BaseObjects
