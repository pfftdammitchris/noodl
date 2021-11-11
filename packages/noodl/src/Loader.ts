import winston from 'winston'
import * as u from '@jsmanifest/utils'
import type { OrArray } from '@jsmanifest/typefest'
import chunk from 'lodash-es/chunk.js'
import flatten from 'lodash-es/flatten.js'
import path from 'path'
import * as fs from 'fs-extra'
import type { DeviceType, Env } from 'noodl-types'
import * as nu from 'noodl-utils'
import invariant from 'invariant'
import axios from 'axios'
import chalk from 'chalk'
import yaml from 'yaml'
import promiseAllSafely from './utils/promiseAllSafely.js'
import stringifyDoc from './utils/stringifyDoc.js'
import shallowMerge from './utils/shallowMerge.js'
import * as c from './constants.js'
import * as t from './types.js'
import { getLinkStructure } from './index.js'

const { existsSync, readFile } = fs
const { createNoodlPlaceholderReplacer, hasNoodlPlaceholder, isValidAsset } = nu

class NoodlLoader<
	Opts extends string = string,
	DataType extends t.Loader.RootDataType = 'map',
> implements t.IAggregator<DataType>
{
	#configKey = ''
	#configVersion = 'latest'
	cbs = {} as Record<string, ((...args: any[]) => any)[]>
	deviceType: DeviceType = 'web'
	env: Env = 'test'
	logger: winston.Logger
	options = {
		dataType: 'map' as const,
		loglevel: 'error' as t.Loader.Options['loglevel'],
	}
	root: t.Loader.Root<DataType>

	constructor(opts: Opts | t.Loader.Options<Opts> = {}) {
		this.logger = winston.createLogger({
			level: 'error',
			transports: [
				new winston.transports.Console({
					format: winston.format.combine(
						winston.format.colorize({
							colors: {
								info: 'cyan',
								http: 'grey',
								warn: 'yellow',
								error: 'red',
								debug: 'gray',
							},
						}),
						winston.format.simple(),
					),
				}),
			],
		})

		if (u.isStr(opts)) {
			this.logger.debug(`Instantiating with config: ${u.cyan(opts)}`)
			this.configKey = opts
		} else {
			const defaultKeys = ['Global']

			this.options = shallowMerge(this.options, opts)
			this.#configKey = opts.config || ''
			this.logger.level = opts.loglevel || this.options.loglevel
			this.logger.debug(`Options`, this.options)
			this.logger.debug(
				`Instantiating with config: ${u.yellow(
					opts.config || '<no config received>',
				)}`,
			)
			if (opts.dataType === 'object') {
				this.logger.debug(
					`Data type set to ${u.yellow(
						`object`,
					)} mode. Root will be a plain object`,
				)
				this.root = { Global: {} } as t.Loader.Root<DataType>
			} else {
				this.logger.debug(
					`Data type set to ${u.yellow(`map`)} mode. Root will be a Map`,
				)
				this.logger.debug(
					`Initiating root with a Map with default keys: ${u.yellow(
						defaultKeys.join(', '),
					)}`,
				)
				;(this.root as Map<any, any>) = new Map([
					['Global', new yaml.Document()],
				])
			}

			this.logger.debug(
				`Initiated root ${
					opts.dataType === 'object' ? `as an object` : 'with a Map'
				} with default keys: ${u.yellow(
					opts.dataType === 'object'
						? u.keys(this.root).join(', ')
						: [...this.root.keys()].join(', '),
				)}`,
			)
		}

		Object.defineProperty(this.root, 'toJSON', {
			value: () => {
				if (this.root instanceof Map) {
					const output = {}
					for (const [name, doc] of this.root) {
						yaml.isDocument(doc) && (output[name] = doc?.toJSON?.())
					}
					return output
				}
				return this.root
			},
		})
	}

	#toRootPageKey = (filepath: string, ext = '.yml') =>
		path
			.basename(filepath, ext.startsWith('.') ? ext : `.${ext}`)
			.replace(/(_en|~\/)/gi, '')

	#getRootConfig = () => this.getInRoot(this.configKey) as yaml.Document

	get appConfigUrl() {
		return `${this.baseUrl}${this.appKey}.yml`
	}

	get appKey() {
		return (
			((this.#getRootConfig()?.get?.('cadlMain') || '') as string)?.replace(
				'.yml',
				'',
			) || ''
		)
	}

	get assetsUrl() {
		return (
			`${this.#getRootConfig()?.get?.('cadlBaseUrl') || ''}assets/`.replace(
				`$\{cadlBaseUrl}`,
				this.baseUrl,
			) || ''
		)
	}

	get baseUrl() {
		return (this.#getRootConfig()?.get?.('cadlBaseUrl') || '') as string
	}

	get configKey() {
		return this.#configKey
	}

	set configKey(configKey) {
		this.#configKey = configKey
		this.emit(c.ON_CONFIG_KEY, configKey)
	}

	get configVersion() {
		if (this.#configVersion === 'latest') {
			return (this.#getRootConfig()?.getIn?.([
				this.deviceType,
				'cadlVersion',
				this.env,
			]) || '') as string
		}
		return this.#configVersion
	}

	set configVersion(configVersion) {
		this.#configVersion = configVersion
	}

	get pageNames() {
		const appConfig = this.getInRoot(this.appKey) as yaml.Document
		const preloadPages =
			(appConfig?.get('preload') as yaml.YAMLSeq)?.toJSON?.() || []
		const pages = (appConfig?.get('page') as yaml.YAMLSeq)?.toJSON?.() || []
		return [...preloadPages, ...pages] as string[]
	}

	emit<Evt extends keyof t.Loader.Hooks>(
		event: Evt,
		args: t.Loader.Hooks[Evt]['args'],
	) {
		this.cbs[event]?.forEach?.((fn) => fn(args))
	}

	extractAssets({ remote = true }: { remote?: boolean } = {}) {
		const assets = [] as t.LinkStructure[]
		const commonUrlKeys = ['path', 'resource'] as string[]
		const visitedAssets = [] as string[]

		const addAsset = (assetPath: string) => {
			if (!visitedAssets.includes(assetPath) && isValidAsset(assetPath)) {
				if (!remote && assetPath.startsWith('http')) return
				visitedAssets.push(assetPath)
				assets.push(
					getLinkStructure(assetPath, {
						prefix: this.assetsUrl,
						config: this.configKey,
					}),
				)
			}
		}

		for (const visitee of this.root.values()) {
			yaml.visit(visitee, {
				Map(key, node) {
					u.forEach((key) => {
						if (node.has(key)) {
							const value = node.get(key)
							if (u.isStr(value)) {
								this.logger.debug(
									`Found ${u.yellow(key)} asset: ${u.magenta(String(value))}`,
								)
								addAsset(value)
							}
						}
					}, commonUrlKeys)
				},
				Pair(key, node) {
					u.forEach((key) => {
						if (yaml.isScalar(node.key) && u.isStr(node.key.value)) {
							if (node.key.value === key) {
								this.logger.debug(
									`Found ${u.yellow(key)} asset: ${u.magenta(
										String(node.value['value']),
									)}`,
								)
								addAsset((node.value as yaml.Scalar<string>).value)
							}
						}
					}, commonUrlKeys)
				},
			})
		}

		return assets
	}

	getConfigVersion(doc = this.getInRoot(this.configKey)): string {
		return (doc as yaml.Document)?.getIn([
			this.deviceType,
			'cadlVersion',
			this.env,
		]) as any
	}

	getPageUrl(pathname: string | undefined) {
		return pathname ? `${this.baseUrl}${pathname}` : ''
	}

	getRawRootConfigYml(): string {
		return this.getInRoot(`${this.configKey}_raw`) as any
	}

	getRawAppConfigYml(): string {
		return this.getInRoot(`${this.appKey}_raw`) as any
	}

	getInRoot(key: string) {
		if (this.root instanceof Map) return this.root.get(key)
		return this.root[key]
	}

	hasInRoot(key: string) {
		if (this.root instanceof Map) return this.root.has(key)
		return key in this.root
	}

	setInRoot(key: string, value: any) {
		if (this.root instanceof Map) this.root.set(key, value)
		this.root[key] = value
	}

	async init({
		dir = '',
		fallback,
		loadPages: shouldLoadPages = true,
		loadPreloadPages: shouldLoadPreloadPages = true,
		spread,
		use,
	}: {
		dir?: string
		fallback?: {
			appConfig?: Parameters<
				NoodlLoader<Opts, DataType>['loadAppConfig']
			>[0]['fallback']
		}
		loadPages?: boolean
		loadPreloadPages?: boolean
		spread?: string | string[]
		use?: {
			baseUrl?: string
		}
	} = {}) {
		invariant(
			!!this.configKey,
			`Cannot initiate the aggregator without setting a config key first`,
		)

		this.logger.info(`Using app key ${u.yellow(this.appKey)}`)
		this.logger.info(`Using device type ${u.yellow(this.deviceType)}`)
		this.logger.info(`Using eCOS environment: ${u.yellow(this.env)}`)

		const result = {
			doc: {
				root: await this.loadRootConfig({ dir }),
				app: await this.loadAppConfig({ dir, fallback: fallback?.appConfig }),
			},
			raw: {
				root: this.getRawRootConfigYml(),
				app: this.getRawAppConfigYml(),
			},
		}

		shouldLoadPreloadPages && (await this.loadPreloadPages({ dir, spread }))
		shouldLoadPages && (await this.loadPages({ dir, spread }))

		return result
	}

	/**
	 *  Loads the root config. If a directory is given it will attempt to load from a file path. It will fallback to a fresh remote fetch if all else fails
	 * @param { string | undefined } options.dir Directory to load the root config from if loading from a directory
	 * @param { string | undefined } options.config Config name to override the current config name if provided
	 */
	async loadRootConfig(opts: {
		dir: string
		config?: string
	}): Promise<yaml.Document>
	async loadRootConfig(config: yaml.Document): Promise<yaml.Document>
	async loadRootConfig(configName?: string): Promise<yaml.Document>
	async loadRootConfig(
		options: yaml.Document | { dir: string; config?: string } | string = this
			.configKey,
	) {
		let configDoc: yaml.Document | undefined
		let configYml = ''

		if (yaml.isDocument(options)) {
			configDoc = options
			configYml = yaml.stringify(options, { indent: 2 })
			this.logger.debug(`Loaded root config with a provided YAMLDocument`)
		} else if (u.isObj(options)) {
			options?.config && (this.configKey = options.config)
			const dir = options.dir || ''
			const configFilePath = path.join(dir, `${this.configKey}.yml`)
			if (existsSync(configFilePath)) {
				this.logger.debug(
					`Loading root config from: ${u.yellow(configFilePath)}`,
				)
				configYml = await readFile(configFilePath, 'utf8')
				configDoc = yaml.parseDocument(configYml)
			} else {
				this.logger.error(
					`Tried to load root config from ${u.yellow(
						configFilePath,
					)} but the location does not exist`,
				)
			}
		} else if (u.isStr(options)) {
			this.configKey = options
			this.logger.debug(`Fetching config ${u.yellow(options)} remotely`)
		}

		invariant(
			!!this.configKey,
			`Cannot retrieve the root config because a config key was not passed in or set`,
		)

		configDoc && !configYml && (configYml = stringifyDoc(configDoc))
		configYml && !configDoc && (configDoc = yaml.parseDocument(configYml))

		const withYmlExt = (s = '') => !s.endsWith('.yml') && (s += '.yml')

		if (!configYml || !configDoc) {
			const configUrl = `https://${
				c.DEFAULT_CONFIG_HOSTNAME
			}/config/${withYmlExt(this.configKey)}`
			this.logger.info(`Config URL: ${u.yellow(configUrl)}`)
			this.emit(c.ON_RETRIEVING_ROOT_CONFIG, { url: configUrl })
			const { data: yml } = await axios.get(configUrl)
			this.logger.debug(`Received config yaml`)
			configDoc = yaml.parseDocument(yml)
			this.logger.debug(`Saved config in memory as a yaml document`)
			configYml = yml
		}

		this.setInRoot(this.configKey, configDoc)
		this.logger.debug(`Root key ${u.yellow(this.configKey)} set`)
		this.setInRoot(`${this.configKey}_raw`, configYml as any)
		this.logger.debug(`Root key ${u.yellow(`${this.configKey}_raw`)} set`)
		this.emit(c.ON_RETRIEVED_ROOT_CONFIG, {
			name: this.configKey,
			doc: configDoc,
			yml: configYml,
		})

		this.configVersion = this.getConfigVersion(configDoc)
		this.logger.info(
			`Config version: ${u.yellow(this.configVersion) || '<unknown>'}`,
		)
		this.emit(c.ON_CONFIG_VERSION, this.configVersion)

		const replacePlaceholders = createNoodlPlaceholderReplacer({
			cadlBaseUrl: configDoc.get('cadlBaseUrl'),
			cadlVersion: this.configVersion,
			designSuffix: '',
		})

		yaml.visit(configDoc, {
			Pair: (key, node) => {
				if (yaml.isScalar(node.key) && node.key.value === 'cadlBaseUrl') {
					this.logger.debug(
						`Encountered base url: ${u.yellow(String(node.value))}`,
					)
					if (
						yaml.isScalar(node.value) &&
						u.isStr(node.value) &&
						hasNoodlPlaceholder(node.value)
					) {
						const before = node.value.value as string
						node.value.value = replacePlaceholders(node.value.value)
						this.logger.info(
							`Setting base url to ${u.magenta(String(node.value.value))}`,
						)
						this.emit(c.ON_PLACEHOLDER_PURGED, {
							before,
							after: node.value.value as string,
						})
						return yaml.visit.SKIP
					}
				}
			},
			Scalar: (key, node) => {
				if (u.isStr(node.value) && hasNoodlPlaceholder(node.value)) {
					const before = node.value
					node.value = replacePlaceholders(node.value)
					this.logger.info(
						`Replaced a placeholder from ${u.yellow(before)} to ${u.magenta(
							String(node.value),
						)}`,
					)
					this.emit(c.ON_PLACEHOLDER_PURGED, {
						before,
						after: node.value as string,
					})
				}
			},
		})

		return configDoc
	}

	/**
	 * Loads the app config. If a directory is passed it will attempt to load the app config from a file path. It will fallback to a fresh remote fetch if all else fails
	 * @param { string | undefined } dir Directory to load from if loading from a directory
	 * @param { function | undefined } fallback Used as a resolution strategy to load the app config if fetching fails
	 * @returns
	 */
	async loadAppConfig({
		dir,
		fallback,
	}: {
		dir?: string
		fallback?: () => Promise<string> | string
	} = {}) {
		invariant(
			!!this.getInRoot(this.configKey),
			'Cannot initiate app config without retrieving the root config',
		)

		// Placeholders should already have been purged by this time
		let appConfigYml = ''
		let appConfigDoc: yaml.Document | undefined
		let yml = ''

		if (dir) {
			const appConfigFilePath = path.resolve(
				path.join(dir, `${this.appKey}.yml`),
			)
			if (existsSync(appConfigFilePath)) {
				this.logger.debug(
					`Loading app config from: ${u.yellow(appConfigFilePath)}`,
				)
				appConfigYml = await readFile(appConfigFilePath, 'utf8')
				this.logger.debug(`Retrieved app config yaml`)
				appConfigDoc = yaml.parseDocument(appConfigYml)
				this.logger.debug(`Loaded app config as a yaml document`)
			} else {
				this.logger.error(
					`Attempted to load the app config (${u.yellow(
						'cadlEndpoint',
					)}) from ${u.yellow(
						appConfigFilePath || '<App config file path is empty>',
					)} but the location does not exist`,
				)
			}
		}

		if (!appConfigYml || !appConfigDoc) {
			this.logger.debug(`Retrieving app config remotely`)
			this.emit(c.ON_RETRIEVING_APP_CONFIG, { url: this.appConfigUrl })
			try {
				yml = (await axios.get(this.appConfigUrl)).data
				this.logger.info(`Retrieved app config yaml`)
			} catch (error) {
				this.logger.error(
					`[${chalk.red('Error')}] ${chalk.yellow('loadAppConfig')}: ${
						(error as Error).message
					}. ` +
						`If a fallback loader was provided, it will be used. ` +
						`Otherwise the app config will be undefined`,
					{ fallbackProvided: u.isFnc(fallback) },
				)
				u.isFnc(fallback) && (yml = await fallback())
			}
		}

		this.emit(c.ON_RETRIEVED_APP_CONFIG, (appConfigYml = yml || appConfigYml))
		if (appConfigYml) {
			this.setInRoot(`${this.appKey}_raw`, appConfigYml as any)
			this.logger.debug(
				`Saved app config yaml on root key: ${u.yellow(`${this.appKey}_raw`)}`,
			)
			appConfigDoc = yaml.parseDocument(appConfigYml)
			this.setInRoot(this.appKey, appConfigDoc)
			this.logger.debug(
				`Loaded app config as a yaml document on root key: ${u.yellow(
					this.appKey,
				)}`,
			)
		} else {
			this.logger.error(
				`Attempted to load app config but it was empty or invalid`,
			)
		}
		this.emit(c.PARSED_APP_CONFIG, {
			name: this.appKey,
			doc: appConfigDoc as yaml.Document,
		})
		return appConfigDoc
	}

	async loadPage(options: {
		name: string
		doc?: yaml.Document
		dir: string
		spread?: OrArray<string>
	}): Promise<yaml.Node | yaml.Document<unknown> | undefined>

	async loadPage(
		name: string | undefined,
		doc?: yaml.Document,
	): Promise<yaml.Node | yaml.Document<unknown> | undefined>

	async loadPage(
		options:
			| {
					name: string
					doc?: yaml.Document
					dir: string
					spread?: OrArray<string>
			  }
			| string
			| undefined = '',
		doc?: yaml.Document,
	) {
		let dir = ''
		let name = ''
		let spread = [] as string[]

		if (u.isObj(options)) {
			name = options.name
			dir = options.dir
			doc = options.doc
			u.forEach((s) => s && spread.push(s), u.array(options.spread))
		}

		try {
			const key = this.#toRootPageKey(name)

			if (dir) {
				if (existsSync(dir)) {
					let filepath = ''

					for (const filename of [`${key}.yml`, `${key}_en.yml`]) {
						filepath = path.join(dir, filename)
						if (existsSync(filepath)) {
							const yml = await readFile(filepath, 'utf8')
							if (yml) {
								this.setInRoot(key, (doc = yaml.parseDocument(yml)))
								this.logger.debug(
									`Saved a yaml node on root key: ${u.yellow(key)}`,
								)
								this.emit(c.ON_RETRIEVED_APP_PAGE, {
									name,
									doc: doc as yaml.Document,
									fromDir: true,
								})
								return this.getInRoot(key || '')
							}
							break
						}
					}
				}
			}

			const spreadKeys = (
				keys: OrArray<string>,
				doc?: yaml.Document | yaml.Document.Parsed,
			) => {
				this.logger.debug(
					`Spreading keys: ${u.yellow(u.array(keys).join(', '))}`,
				)
				const spreadFn = (doc: yaml.Document | yaml.Document.Parsed) => {
					if (yaml.isMap(doc)) {
						for (const pair of doc.items) {
							if (yaml.isScalar(pair.key)) {
								this.setInRoot(String(pair.key.value), pair.value as any)
							}
						}
					} else if (yaml.isDocument(doc)) {
						if (yaml.isMap(doc.contents)) {
							for (const pair of doc.contents.items) {
								if (yaml.isScalar(pair.key)) {
									this.setInRoot(String(pair.key.value), pair.value as any)
								}
							}
						}
					}
				}

				if (doc) {
					spreadFn(doc)
				} else {
					for (const key of u.array(keys)) {
						if (this.hasInRoot(key)) {
							spreadFn(this.getInRoot(key) as yaml.Document)
						}
					}
				}
			}

			if (u.isStr(name)) {
				const pageUrl = this.getPageUrl(`${key}_en.yml`)
				const { data: yml } = await axios.get(pageUrl)
				if (spread.includes(name)) spreadKeys(name, yaml.parseDocument(yml))
				else this.setInRoot(key, (doc = yaml.parseDocument(yml)))
			} else if (name && yaml.isDocument(doc)) {
				if (spread.includes(name)) spreadKeys(name, doc)
				else this.setInRoot(key, doc)
			} else {
				this.logger.error(
					`Page ${u.yellow(
						name || '<empty>',
					)} was not loaded because of bad parameters`,
				)
			}

			if (name) {
				this.logger.info(`Loaded page ${u.yellow(name)}`)
				this.emit(c.ON_RETRIEVED_APP_PAGE, { name, doc: doc as yaml.Document })
				return this.getInRoot(key || '')
			}
		} catch (error) {
			if (error instanceof Error) {
				if ((error as any).response?.status === 404) {
					this.logger.error(
						`[${chalk.red(error.name)}]: Could not find page ${u.red(
							name || '',
						)}`,
					)
					this.emit(c.ON_APP_PAGE_DOESNT_EXIST, { name: name as string, error })
				} else {
					this.logger.error(
						`[${chalk.yellow(error.name)}] on page ${u.red(name || '')}: ${
							error.message
						}`,
					)
				}
				this.emit(c.ON_RETRIEVE_APP_PAGE_FAILED, {
					name: name as string,
					error,
				})
			}
		}
	}

	async loadPreloadPages({
		dir = '',
		spread,
	}: { dir?: string; spread?: OrArray<string> } = {}) {
		const spreadKeys = u.array(spread)
		const preloadPages = [] as string[]
		const seq = (this.getInRoot(this.appKey) as yaml.Document)?.get('preload')

		if (yaml.isSeq(seq)) {
			for (const node of seq.items) {
				if (yaml.isScalar(node) && u.isStr(node.value)) {
					if (!this.hasInRoot(node.value)) {
						let logMsg = `Adding preload page: ${u.yellow(node.value)}`
						if (spreadKeys.includes(node.value)) {
							logMsg += ` (its keys ${u.white(`will spread`)} on root)`
						}
						this.logger.debug(logMsg)
						preloadPages.push(node.value)
					} else {
						this.logger.warn(
							`Preload page "${u.yellow(node.value)}" already exists`,
						)
					}
				}
			}
		}

		return await promiseAllSafely(
			...preloadPages.map(async (page) =>
				this.loadPage({ name: page, dir, spread: spreadKeys }),
			),
		)
	}

	async loadPages({
		chunks = 4,
		dir = '',
		spread,
	}: {
		chunks?: number
		dir?: string
		spread?: OrArray<string>
	} = {}) {
		const pages = [] as string[]
		const nodes = (this.getInRoot(this.appKey) as yaml.Document)?.get('page')

		if (yaml.isSeq(nodes)) {
			for (const node of nodes.items) {
				if (yaml.isScalar(node) && u.isStr(node.value)) {
					!pages.includes(node.value) && pages.push(node.value)
					if (!pages.includes(node.value)) {
						this.logger.info(`Loading page: "${u.yellow(node.value)}"`)
					}
				}
			}
		}

		const chunkedPages = chunk(pages, chunks)

		this.logger.debug(
			`${u.yellow(String(pages.length))} pages are being loaded in ${u.yellow(
				String(chunkedPages.length),
			)} chunks ${u.italic('concurrently')}`,
		)

		const allPages = await Promise.all(
			chunkedPages.map((chunked) =>
				Promise.all(
					chunked.map(async (c) => this.loadPage({ name: c, dir, spread })),
				),
			),
		)

		this.logger.info(
			`${u.yellow(
				String(chunkedPages.length * chunks),
			)} pages in total were loaded`,
		)

		return flatten(allPages)
	}

	on<Evt extends keyof t.Loader.Hooks>(
		evt: Evt,
		fn: (args: t.Loader.Hooks[Evt]['args']) => void,
	) {
		!u.isArr(this.cbs[evt]) && (this.cbs[evt] = [])
		this.cbs[evt]?.push(fn)
		return this
	}
}

export default NoodlLoader
