import Objects from './Objects'
// import { ParseModeObject } from

export interface BasesOptions {
	endpoint?: string
	json?: boolean
	yml?: boolean
}

class BaseSetup extends Objects {
	#api: Objects
	#endpoint: string = ''
	baseUrl: string = ''
	noodlEndpoint: string = ''
	noodlBaseUrl: string = ''
	version: string = ''

	constructor(name: string) {
		super(name)
		this.#api = new Objects(name)
	}

	async load({ basePages = true }: { basePages?: boolean }) {
		// Load/save root config in memory
		await this.#api.fetchObject('rootConfig', this.endpoint)
		// Set version, root baseUrl
		this['version'] = this.getLatestVersion()
		this['baseUrl'] = (
			items.rootConfig.json.cadlBaseUrl || items.rootConfig.json.noodlBaseUrl
		)?.replace?.('${cadlVersion}', this.version)
		this.onRootConfig?.()
		// Set noodl config, endpoint, baseUrl
		this['noodlEndpoint'] = `${this.baseUrl}${items.rootConfig.json.cadlMain}`
		await this.#helper.loadNoodlObject({
			url: this.noodlEndpoint,
			name: 'noodlConfig',
		})
		const noodlConfig = this.#helper.get('noodlConfig')
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

	getLatestVersion() {
		const rootConfig = this.rootConfig.json
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

export default BaseSetup
