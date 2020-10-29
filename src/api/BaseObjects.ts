import get from 'lodash/get'
import {
	AppConfig,
	IBaseObjects,
	IBaseObjectsEvent,
	ObjectResult,
	RootConfig,
} from '../types'
import Objects from './Objects'
import {
	replaceBaseUrlPlaceholder,
	replaceVersionPlaceholder,
} from '../utils/common'

export interface BasesOptions {
	env?: 'test' | 'stable'
	endpoint?: string
}

class BaseObjects extends Objects implements IBaseObjects {
	#callbacks: { [eventName: string]: Function[] } = {}
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
	env: 'test' | 'stable'
	appEndpoint: string = ''
	appBaseUrl: string = ''
	version: string = ''

	constructor(opts: BasesOptions) {
		super('BaseObjects')
		this.env = opts.env || 'test'
		this.#endpoint = opts.endpoint || ''
	}

	async init() {
		// Load/save root config in memory
		let rootConfigResult: ObjectResult<RootConfig>
		let appConfigResult: ObjectResult<AppConfig>
		let rootConfig: RootConfig
		let appConfig: AppConfig

		this.emit(
			'root.config',
			(rootConfigResult = await this.load<RootConfig>(
				'rootConfig',
				this.endpoint,
			)),
		)
		this.emit(
			'version',
			(this['version'] = this.getLatestVersion(rootConfigResult.json)),
		)
		this.emit(
			'app.endpoint',
			(this['appEndpoint'] = replaceVersionPlaceholder(
				rootConfigResult.json?.cadlBaseUrl + rootConfigResult.json?.cadlMain ||
					'',
				this.version,
			)),
		)
		rootConfig = rootConfigResult.json
		this.emit(
			'app.config',
			(appConfigResult = await this.load<AppConfig>(
				'appConfig',
				this.appEndpoint,
			)),
		)

		appConfig = appConfigResult.json

		this.emit(
			'base.url',
			(this['baseUrl'] = replaceVersionPlaceholder(
				rootConfig.cadlBaseUrl,
				this.version,
			)),
		)

		this.emit(
			'app.base.url',
			(this['appBaseUrl'] = replaceBaseUrlPlaceholder(
				appConfig.baseUrl,
				this.baseUrl,
			)),
		)

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
			(acc, [key, value]) => Object.assign(acc, { [key]: value?.json }),
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

	getLatestVersion(rootConfig = this.rootConfig.json) {
		const knownPaths = [`web.cadlVersion.${this.env}`, 'versionNumber']
		for (let index = 0; index < knownPaths.length; index++) {
			const result = get(rootConfig, knownPaths[index])
			if (result) return result
		}
		return ''
	}

	on(eventName: IBaseObjectsEvent, cb: (...args: any[]) => any) {
		this.#addCb(eventName, cb)
		return this
	}

	off(eventName: IBaseObjectsEvent, cb: Function) {
		this.#removeCb(eventName, cb)
		return this
	}

	emit(eventName: IBaseObjectsEvent, ...args: any[]) {
		if (Array.isArray(this.#callbacks[eventName])) {
			this.#callbacks[eventName].forEach((cb) => cb(...args))
		}
		return this
	}

	#addCb = (eventName: string, cb: (...args: any[]) => any) => {
		if (!this.#callbacks[eventName]) this.#callbacks[eventName] = []
		this.#callbacks[eventName].push(cb)
	}

	#removeCb = (eventName: string, cb: Function) => {
		if (!Array.isArray(this.#callbacks[eventName])) {
			if (this.#callbacks[eventName].includes(cb)) {
				const fn = (callback: Function) => callback !== cb
				this.#callbacks[eventName] = this.#callbacks[eventName].filter(fn)
			}
		}
	}
}

export default BaseObjects
