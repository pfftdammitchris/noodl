import * as u from '@jsmanifest/utils'
import { AcceptArray } from '@jsmanifest/typefest'
import curry from 'lodash/curry'
import * as com from 'noodl-common'
import { DeviceType, Env } from 'noodl-types'
import {
	createNoodlPlaceholderReplacer,
	hasNoodlPlaceholder,
	isValidAsset,
} from 'noodl-utils'
import invariant from 'invariant'
import axios from 'axios'
import globby from 'globby'
import chalk from 'chalk'
import yaml from 'yaml'
import chunk from 'lodash.chunk'
import * as util from './utils'
import * as c from './constants'
import * as t from './types'
import { LiteralUnion } from 'type-fest'

class NoodlAggregator {
	#configVersion = 'latest'
	configKey = ''
	cbIds = [] as string[]
	cbs = {} as Record<string, ((...args: any[]) => any)[]>
	deviceType: DeviceType = 'web'
	env: Env = 'test'
	options = {} as t.Options
	root: t.Root

	constructor(opts?: string | t.Options) {
		if (u.isStr(opts)) this.configKey = opts
		else u.assign(this.options, opts)

		this.root = new Map([['Global', new yaml.YAMLMap()]]) as t.Root

		Object.defineProperty(this.root, 'toJSON', {
			value: () => {
				const result = {}
				for (const [name, doc] of this.root) {
					yaml.isDocument(doc) && (result[name] = doc.toJSON())
				}
				return result
			},
		})
	}

	#getRootConfig = () => this.root.get(this.configKey) as yaml.Document

	#getAppConfig = () =>
		this.root.get(
			(this.#getRootConfig()?.get?.('cadlMain') as string) || '',
		) as yaml.Document

	get appConfigUrl() {
		return `${this.baseUrl}${this.appKey}`
	}

	get appKey() {
		return (this.#getRootConfig()?.get?.('cadlMain') || '') as string
	}

	get assetsUrl() {
		return (
			`${this.#getRootConfig()?.get?.('cadlBaseUrl') || ''}assets`.replace(
				`$\{cadlBaseUrl\}`,
				this.baseUrl,
			) || ''
		)
	}

	get baseUrl() {
		return (this.#getRootConfig()?.get?.('cadlBaseUrl') || '') as string
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
		const appConfig = this.root.get(this.appKey) as yaml.Document
		const preloadPages = (appConfig?.get('preload') as yaml.YAMLSeq).toJSON()
		const pages = (appConfig?.get('page') as yaml.YAMLSeq).toJSON()
		return [...preloadPages, ...pages] as string[]
	}

	emit<Evt extends keyof t.Hooks>(event: Evt, args: t.Hooks[Evt]['args']) {
		this.cbs[event]?.forEach?.((fn) => fn(args))
	}

	extractAssets({ remote = true }: { remote?: boolean } = {}) {
		const assets = [] as com.MetadataLinkObject[]
		const commonUrlKeys = ['path', 'resource', 'resourceUrl'] as string[]
		const visitedAssets = [] as string[]

		const isHttp = (s: string | undefined) =>
			s ? /^https?:\/\/[a-zA-Z0-9]+/gi.test(s) : false

		const toAssetLink = (s: string) => `${this.assetsUrl}/${s}`

		const addAsset = (asset: string) => {
			if (!visitedAssets.includes(asset) && isValidAsset(asset)) {
				if (!remote && asset.startsWith('http')) return
				visitedAssets.push(asset)
				const metadata = com.createLinkMetadataExtractor(asset, {
					config: this.configKey,
					url: !asset.includes(this.assetsUrl) ? toAssetLink(asset) : asset,
				})
				assets.push(metadata)
			}
		}

		for (const [name, visitee] of this.root) {
			yaml.visit(visitee, {
				Map(key, node) {
					for (const key of commonUrlKeys) {
						if (node.has(key)) {
							const value = node.get(key)
							if (u.isStr(value)) {
								addAsset(value)
							}
						}
					}
				},
				Scalar(key, node) {
					if (u.isStr(node.value)) {
						if (isHttp(node.value)) {
							addAsset(node.value)
						}
					}
				},
			})
		}

		return assets
	}

	getConfigVersion(doc = this.root.get(this.configKey)): string {
		return (doc as yaml.Document)?.getIn([
			this.deviceType,
			'cadlVersion',
			this.env,
		]) as any
	}

	getPageUrl(name: string | undefined) {
		if (name?.endsWith('.yml')) name = name.replace('.yml', '')
		return name ? `${this.baseUrl}${name}.yml` : ''
	}

	async init({
		loadPages: shouldLoadPages = true,
		loadPreloadPages: shouldLoadPreloadPages = true,
	}: {
		loadPages?: boolean
		loadPreloadPages?: boolean
	} = {}) {
		invariant(
			!!this.configKey,
			`Cannot initiate the aggregator without setting a config key first`,
		)

		const result = {
			doc: {
				root: await this.loadRootConfig(),
				app: await this.loadAppConfig(),
			},
			raw: { root: this.getRawRootConfigYml(), app: this.getRawAppConfigYml() },
		}

		if (shouldLoadPreloadPages) {
			;(await Promise.all(
				util
					.extractPreloadPages(result.doc.app)
					.map(async (preloadPage) => this.loadPage(preloadPage)),
			)) as yaml.Document[]
		}

		if (shouldLoadPages) {
			await this.loadPages()
		}

		return result
	}

	getRawRootConfigYml(): string {
		return this.root.get(`${this.configKey}_raw`) as any
	}

	getRawAppConfigYml(): string {
		return this.root.get(`${this.appKey}_raw`) as any
	}

	async loadAsset(
		url: string | undefined = '',
		{}: {
			metadata?: com.MetadataLinkObject
		},
	) {
		try {
			//
		} catch (error) {
			throw error
		}
	}

	#load = curry(
		(type: LiteralUnion<'doc' | 'yml', string>, items: t.LoadOptions) => {
			if (u.isStr(items)) {
				// Load from local folder
			} else {
				items
				const typeKey = type === 'doc' ? 'doc' : type === 'yml' ? 'yml' : ''
				for (const item of u.array(items)) {
					const name = item.name
					const data = item[typeKey]
					this.root.set(name, type === 'yml' ? yaml.parseDocument(data) : data)
				}
			}
		},
	)

	loadDocs(value: t.LoadOptions<'doc'>) {
		this.#load('doc', value)
		return this
	}

	loadYmls(value: t.LoadOptions<'yml'>) {
		this.#load('yml', value)
		return this
	}

	async loadRootConfig(configName: string = this.configKey) {
		try {
			invariant(
				!!configName,
				`Cannot retrieve the root config because a config key was not passed in or set`,
			)
			configName !== this.configKey && (this.configKey = configName)
			const configUrl = `https://${
				c.DEFAULT_CONFIG_HOSTNAME
			}/config/${com.withYmlExt(configName)}`
			this.emit(c.ON_RETRIEVING_ROOT_CONFIG, { url: configUrl })
			const { data: yml } = await axios.get(configUrl)
			const doc = yaml.parseDocument(yml)
			this.root.set(this.configKey, doc)
			this.root.set(`${this.configKey}_raw`, yml)
			this.emit(c.ON_RETRIEVED_ROOT_CONFIG, { name: this.configKey, doc, yml })
			this.configVersion = this.getConfigVersion(doc)
			this.emit(c.ON_CONFIG_VERSION, this.configVersion)
			const replacePlaceholders = createNoodlPlaceholderReplacer({
				cadlBaseUrl: doc.get('cadlBaseUrl'),
				cadlVersion: this.configVersion,
			})
			yaml.visit(doc, {
				Pair: (key, node) => {
					if (yaml.isScalar(node.key) && node.key.value === 'cadlBaseUrl') {
						if (
							yaml.isScalar(node.value) &&
							u.isStr(node.value) &&
							hasNoodlPlaceholder(node.value)
						) {
							const before = node.value.value as string
							node.value.value = replacePlaceholders(node.value.value)
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
						this.emit(c.ON_PLACEHOLDER_PURGED, {
							before,
							after: node.value as string,
						})
					}
				},
			})
			return doc
		} catch (error) {
			throw error
		}
	}

	async loadAppConfig() {
		invariant(
			!!this.root.get(this.configKey),
			'Cannot initiate app config without retrieving the root config',
		)
		this.emit(c.ON_RETRIEVING_APP_CONFIG, { url: this.appConfigUrl })
		try {
			// Placeholders should already have been purged by this time
			let appConfigYml = ''
			let appConfigDoc: yaml.Document | undefined
			try {
				const { data: yml } = await axios.get(this.appConfigUrl)
				this.emit(c.ON_RETRIEVED_APP_CONFIG, (appConfigYml = yml))
				this.root.set(`${this.appKey}_raw`, appConfigYml as any)
			} catch (error) {
				throw error
			}
			appConfigYml && (appConfigDoc = yaml.parseDocument(appConfigYml))
			if (appConfigDoc) {
				this.root.set(this.appKey, appConfigDoc)
			}
			this.emit(c.PARSED_APP_CONFIG, {
				name: this.appKey.replace('.yml', ''),
				doc: appConfigDoc as yaml.Document,
			})
			return appConfigDoc
		} catch (error) {
			throw error
		}
	}

	async loadPage(name: string | undefined, doc?: yaml.Document) {
		try {
			if (u.isStr(name)) {
				const { data: yml } = await axios.get(this.getPageUrl(name))
				this.root.set(name, (doc = yaml.parseDocument(yml)))
			} else if (name && yaml.isDocument(doc)) {
				this.root.set(name, doc)
			} else {
				u.log(u.red(`Page "${name}" was not loaded because of bad parameters`))
			}
			if (name) {
				this.emit(c.ON_RETRIEVED_APP_PAGE, { name, doc: doc as yaml.Document })
				return this.root.get(name || '')
			}
		} catch (error) {
			if (error instanceof Error) {
				if ((error as any).response?.status === 404) {
					console.log(
						`[${chalk.red(error.name)}]: Could not find page ${u.red(
							name || '',
						)}`,
					)
					this.emit(c.ON_APP_PAGE_DOESNT_EXIST, { name: name as string, error })
				} else {
					console.log(
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

	async loadPreloadPages() {
		const preloadPages = [] as string[]
		const seq = (this.root.get(this.appKey) as yaml.Document)?.get('preload')
		if (yaml.isSeq(seq)) {
			for (const node of seq.items) {
				if (yaml.isScalar(node) && u.isStr(node.value)) {
					preloadPages.push(`${node.value}_en`)
				}
			}
		}
		await com.promiseAllSafe(...preloadPages.map(async (_) => this.loadPage(_)))
	}

	async loadPages({
		chunks = 4,
	}: {
		chunks?: number
	} = {}) {
		const pages = [] as string[]
		const nodes = (this.root.get(this.appKey) as yaml.Document)?.get('page')
		if (yaml.isSeq(nodes)) {
			for (const node of nodes.items) {
				if (yaml.isScalar(node) && u.isStr(node.value)) {
					pages.push(`${node.value}_en`)
				}
			}
		}

		const chunkedPages = chunk(pages, chunks)
		await Promise.all(
			chunkedPages.map((chunked) =>
				Promise.all(chunked.map((c) => this.loadPage(c))),
			),
		)
	}

	on<Evt extends keyof t.Hooks>(
		evt: Evt,
		fn: (args: t.Hooks[Evt]['args']) => void,
		id?: string,
	) {
		!u.isArr(this.cbs[evt]) && (this.cbs[evt] = [])
		if (!this.cbs[evt]?.includes(fn)) {
			if (id && this.cbIds.includes(id)) return this
			this.cbs[evt]?.push(fn)
		}
		id && !this.cbIds.includes(id) && this.cbIds.push(id)
		return this
	}

	// setState(fn: (args: Partial<>a))
}

export default NoodlAggregator
