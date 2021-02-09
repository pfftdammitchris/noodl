import axios from 'axios'
import chalk from 'chalk'
import yaml from 'yaml'
import chunk from 'lodash/chunk'
import { promiseAllSafe, withSuffix } from '../utils/common'
import {
	AnyFn,
	EventId,
	ObjectResult,
	RootConfig as IRootConfig,
	AppConfig as IAppConfig,
} from '../types'
import RootConfig from '../builders/RootConfig'
import AppConfig from '../builders/AppConfig'
import * as c from '../constants'

export interface ConfigOptions {
	config?: string
	host?: string
	version?: string | number
}

export interface OnPage {
	(opts?: { name: string; json: any; yml: string }): Promise<void> | void
}

const createAggregator = function (opts?: ConfigOptions) {
	const api = {
		rootConfig: null as any,
		appConfig: null as any,
	} as { rootConfig: RootConfig; appConfig: AppConfig }

	let configId = opts?.config || 'aitmed'
	let host = opts?.host || 'public.aitmed.com'
	let port = 443
	let initialized = false

	const cbIds = [] as string[]
	const cbs = {} as Record<EventId, AnyFn[]>

	const objects = {
		json: {},
		yml: {},
	} as {
		json: { [name: string]: any }
		yml: { [name: string]: string }
	}

	const withLocale = withSuffix('_en')
	const withExt = withSuffix('.yml')

	function _emit(event: EventId, ...args: any[]) {
		cbs[event]?.forEach?.((fn) => fn(...args))
	}

	async function _getRootConfig() {
		if (!api.rootConfig) api.rootConfig = new RootConfig()
		objects.json[configId] = await api.rootConfig
			.setConfigId(configId)
			.setHost(host)
			.setVersion(opts?.version || 'latest')
			.build()
		objects.yml[configId] = api.rootConfig.yml || ''

		_emit(c.aggregator.event.RETRIEVED_ROOT_CONFIG, {
			name: configId,
			json: objects.json[configId],
			yml: objects.yml[configId],
		})

		return api.rootConfig
	}

	async function _getAppConfig() {
		if (!api.rootConfig) throw new Error('Root config is not loaded')
		if (!api.appConfig) api.appConfig = new AppConfig()
		api.appConfig.setRootConfig(api.rootConfig.json)
		_emit(c.aggregator.event.RETRIEVED_APP_CONFIG, {
			name: 'cadlEndpoint',
			json: (objects.json.cadlEndpoint = await api.appConfig.build()),
			yml: (objects.yml.cadlEndpoint = api.appConfig.yml || ''),
		})
		return api.appConfig
	}

	async function _loadPage(name: string, suffix: string = '') {
		try {
			const url = api.appConfig.getPageUrl(name + suffix)
			objects.yml[name] = (await axios.get(url)).data
			objects.json[name] = yaml.parse(objects.yml[name] as string)

			_emit(c.aggregator.event.RETRIEVED_APP_OBJECT, {
				name,
				json: objects.json[name],
				yml: objects.yml[name],
			})

			return { json: objects.json[name], yml: objects.yml[name] }
		} catch (error) {
			if (error.response?.status === 404) {
				console.log(
					`[${chalk.red(error.name)}]: Could not find page ${chalk.red(name)}`,
				)
			} else {
				console.log(
					`[${chalk.yellow(error.name)}] on page ${chalk.red(name)}: ${
						error.message
					}`,
				)
			}
			_emit(c.aggregator.event.RETRIEVE_APP_OBJECT_FAILED, name)
			return { json: {}, yml: '' }
		}
	}

	function _on(
		event: typeof c.aggregator.event.RETRIEVED_ROOT_CONFIG,
		fn: (opts: ObjectResult<IRootConfig> & { name: string }) => void,
	): typeof o
	function _on(
		event: typeof c.aggregator.event.RETRIEVED_APP_CONFIG,
		fn: (opts: ObjectResult<IAppConfig> & { name: string }) => void,
	): typeof o
	function _on(
		event: EventId,
		fn: (
			opts: ObjectResult & {
				name: string
			},
		) => void,
		id?: string,
	): typeof o
	function _on(event: EventId, fn: AnyFn, id?: string) {
		if (!Array.isArray(cbs[event])) cbs[event] = []
		if (!cbs[event]?.includes(fn)) {
			if (id && cbIds.includes(id)) return
			cbs[event]?.push(fn)
		}
		if (id && !cbIds.includes(id)) cbIds.push(id)
		return o
	}

	function _get(key: 'port'): typeof port
	function _get(key: 'configId'): typeof configId
	function _get(key: 'host'): string
	function _get(ext: 'json'): typeof objects.json
	function _get(ext: 'yml'): typeof objects.yml
	function _get(
		ext?: keyof typeof objects.json,
	): typeof objects.json[keyof typeof objects.json]
	function _get(ext?: never): typeof objects
	function _get(ext?: any) {
		if (typeof ext === 'string') {
			if (ext === 'json') return objects.json
			if (ext === 'yml') return objects.yml
			if (ext === 'cadlEndpoint') return objects.json.cadlEndpoint
			else return objects.json[ext as string]
		}
		return objects
	}

	const o = {
		builder: {
			rootConfig: api.rootConfig,
			appConfig: api.appConfig,
		},
		get initialized() {
			return initialized
		},
		set(ext: 'json' | 'yml', key: string, value: any) {
			if (ext === 'json') objects.json[key] = value
			else if (ext === 'yml') objects.yml[key] = value
			return this
		},
		get: _get,
		setConfigId(value: string) {
			configId = value
			return o
		},
		setHost(value: string) {
			host = value
			return o
		},
		set port(value: number) {
			port = value
		},
		async init(opts?: {
			loadPages?: boolean | { includePreloadPages?: boolean; onPage?: OnPage }
			version?: string | number | 'latest'
		}) {
			api.rootConfig = await _getRootConfig()
			api.appConfig = await _getAppConfig()
			initialized = true
			if (opts?.loadPages) {
				const params = { includePreloadPages: true }
				if (typeof opts.loadPages === 'object') {
					Object.assign(params, opts.loadPages)
				}
				await o.loadPages(params)
			}
			return [objects.json[configId], objects.json['cadlEndpoint']] as [
				rootConfig: IRootConfig,
				appConfig: IAppConfig,
			]
		},
		async loadStartPage() {
			return _loadPage(api.appConfig.startPage, withExt(withLocale('')))
		},
		async loadPreloadPages({ onPage }: { onPage?: OnPage } = {}) {
			await promiseAllSafe(
				...api.appConfig.preload.map(async (page) => {
					const result = await _loadPage(page, withExt(withLocale('')))
					_emit(c.aggregator.event.RETRIEVED_APP_OBJECT, {
						name: page,
						json: result.json,
						yml: result.yml,
					})
					await onPage?.({ name: page, ...result } as any)
				}),
			)
		},
		loadPage: _loadPage,
		async loadPages({
			chunks = 4,
			includePreloadPages,
			onPage,
		}: {
			chunks?: number
			includePreloadPages?: boolean
			onPage?: OnPage
		} = {}) {
			if (includePreloadPages) await o.loadPreloadPages({ onPage })
			const chunkedPageReqs = chunk(
				(api.appConfig.json.page as string[]).map(
					async (page: string): Promise<void> => {
						const result = await _loadPage(
							page as string,
							withExt(withLocale('')),
						)
						return onPage?.({
							name: page,
							json: result.json,
							yml: result.yml || '',
						})
					},
				),
				chunks,
			)
			// Flatten out the promises for parallel reqs
			await promiseAllSafe(...chunkedPageReqs.map((o) => promiseAllSafe(...o)))
		},
		on: _on,
	}

	return o
}

export default createAggregator
