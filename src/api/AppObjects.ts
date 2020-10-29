import { AppConfig, IAppObjects } from '../types'
import Objects from './Objects'

export interface AppObjectsOptions {
	locale?: string
}

class AppObjects extends Objects implements IAppObjects {
	#config: AppConfig
	locale: string

	constructor(config: AppConfig, options?: AppObjectsOptions) {
		super('AppObjects')
		this.#config = config
		this.locale = options?.locale || 'en'
	}

	async init() {
		const pageNames = this.#config?.page || []
		const pageCount = pageNames.length

		console.log(pageNames)
		console.log(`pageCount: ${pageCount}`)
		console.log(this.#config)

		if (pageNames.length) {
			for (let index = 0; index < pageCount; index++) {
				const pageName = pageNames[index]
				const pageObject = await this.load(pageName, this.createUrl(pageName))
				console.log(`Loaded page ${pageName}`, pageObject)
			}
		}

		return Object.entries(this.objects).reduce(
			(acc, [key, value]) => Object.assign(acc, { [key]: value?.json }),
			{},
		)
	}

	createUrl(pageName: string, opts?: { locale?: string }) {
		return `${this.baseUrl}${pageName}_${opts?.locale || this.locale}.yml`
	}

	get assetsUrl() {
		return this.#config.assetsUrl
	}

	get baseUrl() {
		return this.#config.baseUrl
	}

	get config() {
		return this.#config
	}
}

export default AppObjects
