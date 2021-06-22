import * as u from '@jsmanifest/utils'
import * as com from 'noodl-common'
import path from 'path'
import { DeviceType, Env } from 'noodl-types'
import {
	createNoodlPlaceholderReplacer,
	hasNoodlPlaceholder,
	isValidAsset,
} from 'noodl-utils'
import invariant from 'invariant'
import axios from 'axios'
import chalk from 'chalk'
import yaml from 'yaml'
import chunk from 'lodash.chunk'
import * as c from './constants'
import * as t from './types'

class NoodlAggregator {
	#configVersion = 'latest'
	configKey = ''
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

	#toRootPageKey = (filepath: string, ext = '.yml') =>
		path.posix
			.basename(filepath, ext.startsWith('.') ? ext : `.${ext}`)
			.replace(/(_en|\~\/)/gi, '')

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
			`${this.#getRootConfig()?.get?.('cadlBaseUrl') || ''}assets/`.replace(
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
		const assets = [] as com.LinkStructure[]
		const commonUrlKeys = ['path', 'resource'] as string[]
		const visitedAssets = [] as string[]

		const addAsset = (assetPath: string) => {
			if (!visitedAssets.includes(assetPath) && isValidAsset(assetPath)) {
				if (!remote && assetPath.startsWith('http')) return
				visitedAssets.push(assetPath)
				const linkStructure = com.getLinkStructure(assetPath, {
					prefix: this.assetsUrl,
					config: this.configKey,
				})
				assets.push(linkStructure)
			}
		}

		for (const visitee of this.root.values()) {
			yaml.visit(visitee, {
				Map(key, node) {
					commonUrlKeys.forEach((key) => {
						if (node.has(key)) {
							const value = node.get(key)
							u.isStr(value) && addAsset(value)
						}
					})
				},
				Pair(key, node) {
					commonUrlKeys.forEach((key) => {
						if (yaml.isScalar(node.key) && u.isStr(node.key.value)) {
							if (node.key.value === key) {
								addAsset((node.value as yaml.Scalar<string>).value)
							}
						}
					})
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

	getPageUrl(pathname: string | undefined) {
		return pathname ? `${this.baseUrl}${pathname}` : ''
	}

	getRawRootConfigYml(): string {
		return this.root.get(`${this.configKey}_raw`) as any
	}

	getRawAppConfigYml(): string {
		return this.root.get(`${this.appKey}_raw`) as any
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
			raw: {
				root: this.getRawRootConfigYml(),
				app: this.getRawAppConfigYml(),
			},
		}
		shouldLoadPreloadPages && (await this.loadPreloadPages())
		shouldLoadPages && (await this.loadPages())
		return result
	}

	async loadRootConfig(config: yaml.Document): Promise<yaml.Document>
	async loadRootConfig(configName?: string): Promise<yaml.Document>
	async loadRootConfig(configName: yaml.Document | string = this.configKey) {
		let configDoc: yaml.Document | undefined
		let configYml = ''

		if (yaml.isDocument(configName)) {
			configDoc = configName
			configName = this.configKey
		} else if (u.isStr(configName)) {
			this.configKey = configName
		}

		try {
			invariant(
				!!configName,
				`Cannot retrieve the root config because a config key was not passed in or set`,
			)
			if (configDoc) {
				configYml = com.stringifyDoc(configDoc)
			} else {
				const configUrl = `https://${
					c.DEFAULT_CONFIG_HOSTNAME
				}/config/${com.withYmlExt(configName)}`
				this.emit(c.ON_RETRIEVING_ROOT_CONFIG, { url: configUrl })
				const { data: yml } = await axios.get(configUrl)
				configDoc = yaml.parseDocument(yml)
				configYml = yml
			}

			this.root.set(this.configKey, configDoc)
			this.root.set(`${this.configKey}_raw`, configYml as any)
			this.emit(c.ON_RETRIEVED_ROOT_CONFIG, {
				name: this.configKey,
				doc: configDoc,
				yml: configYml,
			})
			this.configVersion = this.getConfigVersion(configDoc)
			this.emit(c.ON_CONFIG_VERSION, this.configVersion)
			const replacePlaceholders = createNoodlPlaceholderReplacer({
				cadlBaseUrl: configDoc.get('cadlBaseUrl'),
				cadlVersion: this.configVersion,
			})
			yaml.visit(configDoc, {
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
			return configDoc
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
			appConfigDoc && this.root.set(this.appKey, appConfigDoc)
			this.emit(c.PARSED_APP_CONFIG, {
				name: this.appKey.replace('.yml', ''),
				doc: appConfigDoc as yaml.Document,
			})
			return appConfigDoc
		} catch (error) {
			throw error
		}
	}

	async loadPage(name: string | undefined = '', doc?: yaml.Document) {
		try {
			const key = this.#toRootPageKey(name)
			if (u.isStr(name)) {
				const { data: yml } = await axios.get(this.getPageUrl(`${key}_en.yml`))
				this.root.set(key, (doc = yaml.parseDocument(yml)))
			} else if (name && yaml.isDocument(doc)) {
				this.root.set(key, doc)
			} else {
				u.log(u.red(`Page "${name}" was not loaded because of bad parameters`))
			}
			if (name) {
				this.emit(c.ON_RETRIEVED_APP_PAGE, { name, doc: doc as yaml.Document })
				return this.root.get(key || '')
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

	async loadPreloadPages(preloadPages: string[] = []) {
		if (preloadPages.length) {
			//
		} else {
			const seq = (this.root.get(this.appKey) as yaml.Document)?.get('preload')
			if (yaml.isSeq(seq)) {
				for (const node of seq.items) {
					if (yaml.isScalar(node) && u.isStr(node.value)) {
						preloadPages.push(node.value)
					}
				}
			}
		}
		return await com.promiseAllSafe(
			...preloadPages.map(async (page) => this.loadPage(page)),
		)
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
					pages.push(node.value)
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
	) {
		!u.isArr(this.cbs[evt]) && (this.cbs[evt] = [])
		this.cbs[evt]?.push(fn)
		return this
	}
}

export default NoodlAggregator
