import axios from 'axios'
import chalk from 'chalk'
import yaml from 'yaml'
import chunk from 'lodash/chunk'
import isPlainObject from 'lodash/isPlainObject'
import { promiseAllSafe, withSuffix } from '../utils/common'
import {
	AnyFn,
	EventId,
	ObjectResult,
	RootConfig as IRootConfig,
	AppConfig as IAppConfig,
	RootConfig,
} from '../types'
import RootConfigBuilder from '../builders/RootConfig'
import AppConfigBuilder from '../builders/AppConfig'
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
	const builder = {
		rootConfig: new RootConfigBuilder(),
		appConfig: new AppConfigBuilder(),
	}

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

	async function _getRootConfig(configId: string = builder.rootConfig.id) {
		if (builder.rootConfig.id !== configId) builder.rootConfig.id = configId
		_emit(c.aggregator.event.RETRIEVED_ROOT_CONFIG, {
			name: configId,
			json: (objects.json[configId] = await builder.rootConfig.build()),
			yml: (objects.yml[configId] = builder.rootConfig.yml),
		})
		builder.appConfig.rootConfig = builder.rootConfig.json as RootConfig
		return builder.rootConfig.json
	}

	async function _getAppConfig() {
		if (!builder.appConfig.rootConfig) {
			throw new Error(
				'Cannot initiate app config before initializing the root config',
			)
		}
		_emit(c.aggregator.event.RETRIEVED_APP_CONFIG, {
			name: 'cadlEndpoint',
			json: (objects.json.cadlEndpoint = await builder.appConfig.build()),
			yml: (objects.yml.cadlEndpoint = builder.appConfig.yml || ''),
		})
		return builder.appConfig.json
	}

	async function _loadPage(name: string, suffix: string = '') {
		try {
			const url = builder.appConfig.getPageUrl(name + suffix)
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
			get rootConfig() {
				return builder.rootConfig
			},
			set rootConfig(inst) {
				builder.rootConfig = inst
			},
			get appConfig() {
				return builder.appConfig
			},
			set appConfig(inst) {
				builder.appConfig = inst
			},
		},
		get config() {
			return builder.rootConfig.id
		},
		set config(config: string) {
			builder.rootConfig.id = config
		},
		set(ext: 'json' | 'yml', key: string, value: any) {
			if (ext === 'json') objects.json[key] = value
			else if (ext === 'yml') objects.yml[key] = value
			return this
		},
		get: _get,
		async init(opts?: {
			loadPages?: boolean | { includePreloadPages?: boolean; onPage?: OnPage }
			version?: string | number | 'latest'
		}) {
			await _getRootConfig()
			await _getAppConfig()
			if (opts?.loadPages) {
				const params = { includePreloadPages: true }
				isPlainObject(opts.loadPages) && Object.assign(params, opts.loadPages)
				await o.loadPages(params)
			}
			return [objects.json[o.config], objects.json['cadlEndpoint']] as [
				rootConfig: IRootConfig,
				appConfig: IAppConfig,
			]
		},
		async loadPreloadPages() {
			await promiseAllSafe(
				...(builder.appConfig.json?.preload.map((page) =>
					_loadPage(page, withExt(withLocale(''))),
				) || []),
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
			if (includePreloadPages) await o.loadPreloadPages()
			const chunkedPageReqs = chunk(
				(builder.appConfig.json?.page as string[]).map(
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
