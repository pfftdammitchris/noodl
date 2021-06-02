import * as u from '@jsmanifest/utils'
import unary from 'lodash/unary'
import invariant from 'invariant'
import axios from 'axios'
import chalk from 'chalk'
import yaml from 'yaml'
import chunk from 'lodash/chunk'
import * as co from '../../utils/color'
import { createLinkMetadataExtractor, withSuffix } from '../../utils/common'
import {
	createNoodlPlaceholderReplacer,
	hasNoodlPlaceholder,
	isValidAsset,
} from '../../utils/noodl-utils'
import { DEFAULT_CONFIG_HOSTNAME } from '../../constants'
import { MetadataLinkObject } from '../../types'
import * as c from './constants'
import * as t from './types'

const createAggregator = function (options?: string | t.Options) {
	let opts = u.isStr(options) ? { config: options } : options
	let baseUrl = '' // Updated in loadRootConfig
	let appConfigUrl = '' // Updated in loadRootConfig
	let appKey = '' // value of cadlMain // Updated in loadRootConfig
	let configKey = opts?.config || '' // Updated in loadRootConfig
	let configVersion = 'latest' // Updated in loadRootConfig
	let cbIds = [] as string[]
	let cbs = {} as Record<string, ((...args: any[]) => any)[]>
	let deviceType = opts?.deviceType || 'web'
	let env = opts?.env || 'test'
	let root = new Map([['Global', new yaml.YAMLMap()]]) as t.Root

	Object.defineProperty(root, 'toJSON', {
		value: function () {
			const result = {}
			for (const [name, doc] of root) {
				yaml.isDocument(doc) && (result[name] = doc.toJSON())
			}
			return result
		},
	})

	function emit<Evt extends keyof t.Hooks>(
		event: Evt,
		args: t.Hooks[Evt]['args'],
	) {
		cbs[event]?.forEach?.((fn) => fn(args))
	}
	const withYmlExt = withSuffix('.yml')
	const getConfigVersion = (doc = root.get(configKey)) =>
		(doc as yaml.Document)?.getIn([deviceType, 'cadlVersion', env]) as string
	const getRawRootConfigYml = (): string => root.get(`${configKey}_raw`) as any
	const getRawAppConfigYml = (): string => root.get(`${appKey}_raw`) as any

	async function loadRootConfig(configName = configKey) {
		try {
			invariant(
				!!configName,
				`Cannot retrieve the root config because a config key is not set`,
			)
			const { data: yml } = await axios.get(
				`https://${DEFAULT_CONFIG_HOSTNAME}/config/${withYmlExt(configName)}`,
			)
			const doc = yaml.parseDocument(yml)
			root.set(configName, doc)
			root.set(`${configName}_raw`, yml)
			emit(c.RETRIEVED_ROOT_CONFIG, { name: configName, doc })
			configVersion = getConfigVersion(doc)
			const replacePlaceholders = createNoodlPlaceholderReplacer({
				cadlBaseUrl: doc.get('cadlBaseUrl'),
				cadlVersion: configVersion,
			})
			yaml.visit(doc, {
				Pair(key, node) {
					if (yaml.isScalar(node.key) && node.key.value === 'cadlBaseUrl') {
						if (yaml.isScalar(node.value)) {
							node.value.value = replacePlaceholders(node.value.value)
							return yaml.visit.SKIP
						}
					}
				},
				Scalar(key, node) {
					if (u.isStr(node.value) && hasNoodlPlaceholder(node.value)) {
						node.value = replacePlaceholders(node.value)
					}
				},
			})
			baseUrl = String(doc.get('cadlBaseUrl') || '')
			appKey = String(doc.get('cadlMain') || '')
			appConfigUrl = `${baseUrl}${appKey}`
			return doc
		} catch (error) {
			throw error
		}
	}

	async function loadAppConfig() {
		invariant(
			!!root.get(configKey),
			'Cannot initiate app config without retrieving the root config',
		)
		emit(c.RETRIEVING_APP_CONFIG, { url: appConfigUrl })
		try {
			// Placeholders should already have been purged by this time
			let appConfigYml = ''
			let appConfigDoc: yaml.Document.Parsed<any> | undefined
			try {
				const { data: yml } = await axios.get(appConfigUrl)
				emit(c.RETRIEVED_APP_CONFIG, (appConfigYml = yml))
				root.set(`${appKey}_raw`, appConfigYml as any)
			} catch (error) {
				throw error
			}
			appConfigYml && (appConfigDoc = yaml.parseDocument(appConfigYml))
			appConfigDoc && root.set(appKey, appConfigDoc)
			emit(c.PARSED_APP_CONFIG, {
				name: appKey.replace('.yml', ''),
				doc: appConfigDoc as yaml.Document,
			})
			return appConfigDoc
		} catch (error) {
			throw error
		}
	}

	async function loadPage(name: string | undefined, doc?: yaml.Document) {
		try {
			if (u.isStr(name)) {
				const { data: yml } = await axios.get(o.getPageUrl(name))
				root.set(name, (doc = yaml.parseDocument(yml)))
			} else if (name && yaml.isDocument(doc)) {
				root.set(name, doc)
			} else {
				u.log(u.red(`Page "${name}" was not loaded because of bad parameters`))
			}
			if (name) {
				emit(c.RETRIEVED_APP_PAGE, { name, doc: doc as yaml.Document })
				return root.get(name || '')
			}
		} catch (error) {
			if (error.response?.status === 404) {
				console.log(
					`[${chalk.red(error.name)}]: Could not find page ${co.red(
						name || '',
					)}`,
				)
				emit(c.APP_PAGE_DOES_NOT_EXIST, { name: name as string, error })
			} else {
				console.log(
					`[${chalk.yellow(error.name)}] on page ${co.red(name || '')}: ${
						error.message
					}`,
				)
			}
			emit(c.RETRIEVE_APP_PAGE_FAILED, { name: name as string, error })
		}
	}

	async function loadAsset(
		url: string | undefined = '',
		{}: {
			metadata?: MetadataLinkObject
		},
	) {
		try {
			//
		} catch (error) {
			throw error
		}
	}

	const o = {
		get pageNames() {
			const appConfig = o.root.get(o.appKey) as yaml.Document
			const preloadPages = (appConfig?.get('preload') as yaml.YAMLSeq).toJSON()
			const pages = (appConfig?.get('page') as yaml.YAMLSeq).toJSON()
			return [...preloadPages, ...pages] as string[]
		},
		get assetsUrl() {
			return `${o.baseUrl}assets`
		},
		get baseUrl() {
			if (!baseUrl) {
				if (root.has(o.configKey)) {
					const doc = root.get(o.configKey)
					const cadlBaseUrl = (doc as yaml.Document)?.get(
						'cadlBaseUrl',
					) as string
					if (cadlBaseUrl) {
						baseUrl = hasNoodlPlaceholder(cadlBaseUrl)
							? createNoodlPlaceholderReplacer({
									cadlBaseUrl,
									cadlVersion: getConfigVersion(doc),
							  })(cadlBaseUrl)
							: cadlBaseUrl
					}
				}
			}
			return baseUrl
		},
		get appKey() {
			return appKey || ''
		},
		get configKey() {
			return (configKey as string) || ''
		},
		set configKey(config: string) {
			configKey = config
		},
		get configVersion() {
			return configVersion || ''
		},
		set configVersion(version: string) {
			configVersion = version
		},
		get deviceType() {
			return deviceType
		},
		set deviceType(deviceType) {
			deviceType = deviceType
		},
		get env() {
			return env
		},
		set env(env: 'stable' | 'test') {
			env = env
		},
		get root() {
			return root
		},
		extractAssets() {
			const assets = [] as MetadataLinkObject[]
			const commonUrlKeys = ['path', 'resource', 'resourceUrl'] as string[]
			const visitedAssets = [] as string[]

			function isHttp(s: string | undefined) {
				return s ? /^https?:\/\/[a-zA-Z]+/i.test(s) : false
			}

			function toAssetLink(s: string) {
				return `${o.assetsUrl}/${s}`
			}

			function addAsset(asset: string) {
				if (!visitedAssets.includes(asset) && isValidAsset(asset)) {
					visitedAssets.push(asset)
					const metadata = createLinkMetadataExtractor(asset, {
						config: o.configKey,
						url: !isHttp(asset) ? toAssetLink(asset) : asset,
					})
					assets.push(metadata)
				}
			}

			for (const [name, visitee] of o.root) {
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
		},
		getPageUrl(name: string | undefined) {
			if (name?.endsWith('.yml')) name = name.replace('.yml', '')
			return name ? `${o.baseUrl}${name}.yml` : ''
		},
		async init({
			loadPages: shouldLoadPages,
		}: {
			loadPages?: boolean | { includePreloadPages?: boolean }
		}) {
			const rootConfigDoc = await loadRootConfig()
			const appConfigDoc = await loadAppConfig()
			if (shouldLoadPages) {
				const params = { includePreloadPages: true }
				u.isObj(shouldLoadPages) && u.assign(params, shouldLoadPages)
				await o.loadPages(params)
			}
			return {
				doc: { root: rootConfigDoc, app: appConfigDoc },
				raw: { root: getRawRootConfigYml(), app: getRawAppConfigYml() },
			}
		},
		async loadPreloadPages() {
			const preloadPages = [] as string[]
			const seq = (root.get(appKey) as yaml.Document)?.get('preload')
			if (yaml.isSeq(seq)) {
				for (const node of seq.items) {
					if (yaml.isScalar(node) && u.isStr(node.value)) {
						preloadPages.push(`${node.value}_en`)
					}
				}
			}
			await Promise.all(preloadPages.map(unary(loadPage)) || [])
		},
		loadPage,
		async loadPages({
			chunks = 4,
			includePreloadPages = true,
		}: {
			chunks?: number
			includePreloadPages?: boolean
		} = {}) {
			if (includePreloadPages) await o.loadPreloadPages()
			const pages = [] as string[]
			const nodes = (root.get(appKey) as yaml.Document)?.get('page')
			if (yaml.isSeq(nodes)) {
				for (const node of nodes.items) {
					if (yaml.isScalar(node) && u.isStr(node.value)) {
						pages.push(`${node.value}_en`)
					}
				}
			}
			// Flatten out the promises for parallel reqs
			await Promise.all(
				chunk(await Promise.all(pages.map(unary(o.loadPage))), chunks),
			)
		},
		loadAsset,
		on<Evt extends keyof t.Hooks>(
			evt: Evt,
			fn: (args: t.Hooks[Evt]['args']) => void,
			id?: string,
		) {
			!u.isArr(cbs[evt]) && (cbs[evt] = [])
			if (!cbs[evt]?.includes(fn)) {
				if (id && cbIds.includes(id)) return o
				cbs[evt]?.push(fn)
			}
			id && !cbIds.includes(id) && cbIds.push(id)
			return o
		},
	}

	return o
}

export default createAggregator
