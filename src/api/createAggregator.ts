import axios from 'axios'
import chalk from 'chalk'
import yaml from 'yaml'
import chunk from 'lodash/chunk'
import { eventId } from '../constants'
import { withSuffix } from '../utils/common'
import { AnyFn, EventId, ObjectResult } from '../types'
import RootConfig from '../builders/RootConfig'
import AppConfig from '../builders/AppConfig'

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

	let config = opts?.config || 'aitmed'
	let host = opts?.host || 'public.aitmed.com'

	const cbIds = [] as string[]
	const cbs = {} as Record<EventId, AnyFn[]>

	const objects = {
		json: {},
		yml: {},
	} as ObjectResult

	const withLocale = withSuffix('_en')
	const withExt = withSuffix('.yml')

	function _emit(event: EventId, ...args: any[]) {
		cbs[event]?.forEach?.((fn) => fn(...args))
	}

	async function _loadPage(name: string, suffix: string = '') {
		try {
			const url = api.appConfig.getPageUrl(name + suffix)
			objects.yml[name] = (await axios.get(url)).data
			objects.json[name] = yaml.parse(objects.yml[name] as string)

			return { json: objects.json[name], yml: objects.yml[name] }
		} catch (error) {
			if (error.response?.status === 404) {
				console.log(
					`[${chalk.red(error.name)}] on page ${chalk.red(
						name,
					)}: Could not find page or page not found`,
				)
			} else {
				console.log(
					`[${chalk.yellow(error.name)}] on page ${chalk.red(name)}: ${
						error.message
					}`,
				)
			}
			return { json: {}, yml: '' }
		}
	}

	const o = {
		get(ext?: 'json' | 'yml') {
			if (typeof ext === 'string') {
				if (ext === 'json') return objects.json
				if (ext === 'yml') return objects.yml
			}
			return objects
		},
		setConfig(value: string) {
			config = value
			return o
		},
		setHost(value: string) {
			host = value
			return o
		},
		async init(opts?: {
			loadPages?: boolean | { includePreloadPages?: boolean; onPage?: OnPage }
			version?: string | number | 'latest'
		}) {
			api.rootConfig = new RootConfig()
			api.appConfig = new AppConfig()
			objects.json[config] = await api.rootConfig
				.setConfig(config)
				.setHost(host)
				.setVersion(opts?.version || 'latest')
				.build()
			objects.yml[config] = objects.json[config]?.yml
			_emit(eventId.RETRIEVED_ROOT_CONFIG, {
				json: objects.json[config],
				yml: objects.yml[config],
			})
			objects.json['cadlEndpoint'] = await api.appConfig
				.setRootConfig(objects.json[config] as any)
				.build()
			objects.yml['cadlEndpoint'] = objects.json.cadlEndpoint.yml
			_emit(eventId.RETRIEVED_APP_CONFIG, {
				json: objects.json.cadlEndpoint,
				yml: objects.yml.cadlEndpoint,
			})
			if (opts?.loadPages) {
				await o.loadPages({
					includePreloadPages: true,
					...(typeof opts.loadPages === 'object' ? opts.loadPages : undefined),
				})
			}
			return [objects.json[config], objects.json['cadlEndpoint']]
		},
		async loadStartPage() {
			return _loadPage(api.appConfig.startPage, withExt(withLocale('')))
		},
		async loadPreloadPages({ onPage }: { onPage?: OnPage } = {}) {
			await Promise.all(
				api.appConfig.preload.map(async (page) => {
					const result = await _loadPage(page, withExt(withLocale('')))
					await onPage?.({ name: page, ...result } as any)
				}),
			)
		},
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
						_emit(eventId.RETRIEVED_APP_OBJECT, result)
						return onPage?.({ name: page, ...result } as any)
					},
				),
				chunks,
			)
			// Flatten out the promises for parallel reqs
			await Promise.all(chunkedPageReqs.map((o) => Promise.all(o)))
		},
		on(event: EventId, fn: AnyFn, id: string) {
			if (!Array.isArray(cbs[event])) cbs[event] = []
			if (!cbs[event]?.includes(fn)) {
				if (id && cbIds.includes(id)) return
				cbs[event]?.push(fn)
			}
			if (id && !cbIds.includes(id)) cbIds.push(id)
			return o
		},
	}

	return o
}

export default createAggregator
