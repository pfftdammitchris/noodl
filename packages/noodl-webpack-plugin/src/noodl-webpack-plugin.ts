import * as u from '@jsmanifest/utils'
import get from 'lodash/get'
import { RootConfig, AppConfig } from 'noodl-types'
import invariant from 'invariant'
import pick from 'lodash/pick'
import {
	Document,
	isSeq,
	parse as parseToJson,
	parseDocument,
	stringify,
	YAMLSeq,
} from 'yaml'
import { Compiler } from 'webpack'
import WebSocket from 'ws'
import chokidar from 'chokidar'
import express from 'express'
import globby from 'globby'
import fs from 'fs-extra'
import path from 'path'
import {
	createPlaceholderReplacers,
	ensureBeginsWithSingleSlash,
	ensurePageName,
	getMetadataObject,
	loadFile,
	isPageDoc,
	isYml,
	replaceBaseUrlPlaceholder,
	replaceDesignSuffixPlaceholder,
	replaceTildePlaceholder,
	replaceVersionPlaceholder,
	request,
} from './utils'
import * as t from './types'
import * as c from './constants'
import { SetRequired } from 'type-fest'

interface Options {
	config?: string
	deviceType?: 'web' | 'android' | 'ios'
	env?: 'test' | 'stable'
	hostname?: string
	locale?: string
	staticPaths?: [
		route: string,
		request: (req: Parameters<express.RequestHandler>[0]) => void,
		response: (res: Parameters<express.RequestHandler>[1]) => void,
	][]
	server?: boolean
	serverDir?: string
	serverPort?: number | string
	version?: 'latest' | number
	wss?: boolean
	wssPort?: number | string
}

const pluginName = 'noodl-webpack-plugin'
const tag = `[${u.cyan(pluginName)}]`
const info = (s1: string, ...s2: any[]) => u.log(`${tag} ${s1}`, ...s2)
const getAbsPath = (...s: string[]) =>
	path.resolve(path.join(process.cwd(), ...s))

class NoodlWebpackPlugin {
	#cadlBaseUrl = ''
	#other = [] as string[]
	#assets = [] as t.MetadataObject[]
	#server: express.Express | undefined
	#watch: chokidar.FSWatcher | undefined
	#wss: WebSocket.Server | undefined
	#yml = [] as t.MetadataObject[]
	options = {} as Required<Options>

	static pluginName = pluginName

	constructor(options: SetRequired<Options, 'config'>) {
		const {
			config,
			deviceType = c.DEFAULT_DEVICE_TYPE,
			env = c.DEFAULT_ENV,
			hostname = c.DEFAULT_HOSTNAME,
			locale = c.DEFAULT_LOCALE,
			server = true,
			serverDir = c.DEFAULT_SERVER_PATH,
			serverPort = c.DEFAULT_SERVER_PORT,
			staticPaths,
			wss = true,
			wssPort = c.DEFAULT_WSS_PORT,
			version = c.DEFAULT_CONFIG_VERSION,
		} = options

		invariant(!!config, `A config value is required`)

		this.options.config = config
		this.options.deviceType = deviceType
		this.options.env = env
		this.options.hostname = hostname
		this.options.locale = locale
		this.options.server = server
		this.options.serverDir = getAbsPath(serverDir)
		this.options.serverPort = serverPort
		this.options.staticPaths = staticPaths || []
		this.options.version = version
		this.options.wss = wss
		this.options.wssPort = wssPort

		invariant(
			fs.existsSync(this.options.serverDir),
			`The path ${this.options.serverDir} does not exist`,
		)
	}

	get config() {
		return this.options.config
	}

	set config(config) {
		this.options.config = config
	}

	get server() {
		return this.#server as express.Express
	}

	get watcher() {
		return this.#watch as chokidar.FSWatcher
	}

	get wss() {
		return this.#wss as WebSocket.Server
	}

	get serverUrl() {
		return `http://${this.options.hostname}:${this.options.serverPort}`
	}

	get wssUrl() {
		return `ws://${this.options.hostname}:${this.options.wssPort}`
	}

	async apply(compiler: Compiler) {
		u.newline()

		info(`Config: ${u.green(this.config)}`)
		info(`Serving files at: ${u.green(this.serverUrl)}`)
		info(`Path to server files: ${u.green(this.options.serverDir)}`)

		const {
			config,
			deviceType,
			env,
			hostname,
			locale,
			server: enableServer,
			serverPort,
			serverDir,
			staticPaths,
			version,
			wss: enableWss,
		} = this.options

		info(`Searching your directory for the config file...`)

		const localFiles = (await globby(path.join(serverDir, '**/*'), {
			onlyFiles: true,
		})) as string[]

		let configRegEx = new RegExp(`(${this.config}|${this.config}.yml)`, 'i')
		let configFilePath = localFiles.find((filepath) =>
			configRegEx.test(filepath),
		)
		let configDoc: Document | Document.Parsed | undefined
		let configRemotelyFetched = false
		let configYml = ''
		let configVersion = ''

		if (configFilePath) {
			try {
				info(`Found ${u.yellow(configFilePath)}`)
				configDoc = parseDocument(loadFile(configFilePath))
			} catch (error) {
				throw error
			}
		} else {
			info(
				`Config file not found. ` +
					`Downloading remotely and saving it to your dir...`,
			)
			// Prompt first time config
			// Else use saved config as default
			configYml = (await request(
				`https://public.aitmed.com/config/${config}.yml`,
			)) as string

			configRemotelyFetched = true

			info(`Received config in (YML)`)

			configDoc = parseDocument(configYml)

			try {
				const configFileName = `${config}.yml`
				await fs.writeFile(
					path.join(serverDir, configFileName),
					stringify(configDoc),
					'utf8',
				)
				info(`Created and saved ${u.yellow(configFileName)} to your dir`)
			} catch (error) {
				throw new Error(error)
			}
		}

		info(
			`Loading the config using ${u.yellow(deviceType)} with version ` +
				`${u.yellow(String(version))} in ${u.yellow(String(env))} ` +
				`environment (You can change these settings by passing them into the plugin's options)`,
		)

		let rootConfigObject = configDoc.toJSON() as RootConfig
		let appConfig: AppConfig
		let appConfigYml = ''
		let appConfigUrl = ''

		configVersion = this.getConfigVersion(rootConfigObject)

		info(
			`Selected config version: ${u.yellow(configVersion)}${
				version === 'latest' ? ` (latest)` : ''
			}`,
		)

		const parsedRootConfig = this.parseConfig(rootConfigObject)

		appConfigUrl = `${parsedRootConfig.cadlBaseUrl}${parsedRootConfig.cadlMain}`

		info(`Root config was parsed`)

		this.#cadlBaseUrl = parsedRootConfig.cadlBaseUrl

		info(`apiHost: ${u.yellow(parsedRootConfig.apiHost)}`)
		info(`appApiHost: ${u.yellow(parsedRootConfig.appApiHost)}`)
		info(`webApiHost: ${u.yellow(parsedRootConfig.webApiHost)}`)
		info(`apiPort: ${u.yellow(parsedRootConfig.apiPort)}`)
		info(`cadlBaseUrl: ${u.yellow(this.#cadlBaseUrl)}`)

		if (parsedRootConfig.myBaseUrl) {
			info(`myBaseUrl: ${u.yellow(parsedRootConfig.myBaseUrl)}`)
		}

		if (parsedRootConfig.timestamp) {
			info(`timestamp: ${u.yellow(parsedRootConfig.timestamp)}`)
		}

		if (configRemotelyFetched) {
			info(`Retrieving app config from ${u.yellow(appConfigUrl)}`)
			appConfigYml = (await request(appConfigUrl)) as string
		} else {
			const appConfigFilePath = localFiles.find((filepath) =>
				filepath.endsWith(parsedRootConfig.cadlMain),
			)
			if (appConfigFilePath) {
				info(`Loading app config...`)
				appConfigYml = loadFile(appConfigFilePath)
			} else {
				info(`Missing app config file from the dir. Fetching remotely now...`)
				appConfigYml = (await request(appConfigUrl)) as string
			}
		}

		if (appConfigYml) info(`App config was retrieved as YAML`)
		else throw new Error(`Could not load the app config YAML`)

		appConfig = parseToJson(appConfigYml)

		if (appConfig) {
			appConfig = this.parseConfig(appConfig, rootConfigObject)
			info(`App config was parsed`)
			info(`assetsUrl: ${u.yellow(appConfig.assetsUrl)}`)
			info(`baseUrl: ${u.yellow(appConfig.baseUrl)}`)
			info(`startPage: ${u.yellow(appConfig.startPage)}`)
			info(`No. preload pages: ${u.yellow(appConfig.preload?.length || 0)}`)
			info(`No. pages: ${u.yellow(appConfig.page?.length || 0)}`)
		} else {
			throw new Error(`Could not load the app config object`)
		}

		const preloadPages = appConfig.preload as string[]
		const pages = appConfig.page as string[]

		preloadPages.length &&
			info(
				`${u.yellow(String(preloadPages.length))} preload pages being loaded`,
			)
		pages.length && info(`Total pages: ${u.yellow(String(pages.length))}`)

		/**
		 * 1. Scan all files
		 * 2. Separate config files from non-config files
		 */

		if (localFiles.length) {
			info(
				`Loading ${u.yellow(
					String(localFiles.length),
				)} files mentioned in ${u.green(`${this.config}.yml`)}`,
			)
		} else {
			info(`No local files found in ${u.yellow(serverDir)}`)
		}

		const missingPages = [] as t.File[]

		for (const filepath of localFiles) {
			if (!filepath?.includes('.')) continue
			if (/\/assets?/i.test(filepath)) {
				this.#assets.push(getMetadataObject(filepath))
			} else if (isYml(filepath)) {
				this.#yml.push(getMetadataObject(filepath, { config: this.config }))
			} else {
				this.#other.push(filepath)
			}
		}

		this.listen({
			server: enableServer
				? (this.#server = express() as express.Express)
				: false,
			wss: enableWss
				? (this.#wss = new WebSocket.Server({
						host: this.options.hostname,
						port: Number(this.options.wssPort),
				  }))
				: false,
			watch: (this.#watch = chokidar.watch(path.join(serverDir, '**/*'), {
				cwd: process.cwd(),
				ignoreInitial: true,
			})),
		})
	}

	getRoutes({ filename, group }: t.MetadataObject) {
		if (group === 'page') {
			let route = ensureBeginsWithSingleSlash(filename)
			isYml(route) && (route = route.replace('.yml', ''))
			return [route, `${route}.yml`, `${route}_en.yml`] as string[]
		} else {
			return [filename, `/assets/${filename.replace('/', '')}`]
		}
	}

	/**
	 * @param { object } options
	 * @param { express.Express } options.server
	 * @param { WebSocket.Server } options.wss
	 * @param { chokidar.FSWatcher } options.watch
	 */
	listen({
		server,
		wss,
		watch,
	}: {
		server: express.Express | false
		wss: WebSocket.Server | false
		watch: chokidar.FSWatcher
	}) {
		const comet = '\u2604\uFE0F'
		const croissant = '\uD83D\uDE48'

		const tags = {
			ws: u.bold(u.cyan('ws')),
			host: u.yellow(this.options.hostname),
			port: u.yellow(String(this.options.serverPort)),
			slash: u.white('://'),
			config: u.yellow(this.options.config),
			watch: u.cyan(`watch`),
		}

		const registerRoute = (type: 'asset' | 'page') => {
			const register = (obj: t.MetadataObject) => {
				let filename = ensureBeginsWithSingleSlash(obj.filename)
				let routes: string[]
				if (type === 'asset') {
					//
				} else {
					filename = ensurePageName(filename)
					obj.group = 'page'
					if (server) {
						const route = server.get(
							(routes = this.getRoutes(obj)),
							(req, res, next) => {
								res.send(loadFile(obj.filepath))
								next()
							},
						)
					}
				}
			}
			return register
		}

		server && server.use(express.static(this.options.serverDir))

		for (const obj of this.options.staticPaths) {
			server &&
				server.get(
					this.getRoutes(getMetadataObject(obj[0])),
					(req, res, next) => {
						obj[1]?.(req)
						obj[2]?.(res)
						return next()
					},
				)
		}

		const registerAssetRoute = registerRoute('asset')
		const registerPageRoute = registerRoute('page')

		this.#assets.forEach(registerAssetRoute)
		this.#yml.forEach(registerPageRoute)

		server &&
			server.listen(this.options.serverPort, () => {
				wss &&
					wss
						.on('listening', () => {})
						.on('connection', (ws) => {
							ws.on('message', (message) => {
								const data = (
									u.isStr(message) ? JSON.parse(message) : message
								) as t.Message.Base

								info('Received: ', data)

								if (data.from === 'webext') {
									switch (data.type) {
										case 'DOM_LOADED':
										default:
											break
									}
								} else {
									if (data.type === 'track') {
										//
									}
								}
							})
						})
						// .on('headers', (headers, { headers: headersObject, socket, url }) => {
						// 	info(`Headers string`, headers)
						// 	info(`Headers string`, headersObject)
						// 	info(`Socket info`, {
						// 		...pick(socket, [
						// 			'localAddress',
						// 			'localPort',
						// 			'remoteAddress',
						// 			'remoteFamily',
						// 			'remotePort',
						// 		] as (keyof typeof socket)[]),
						// 		address: socket.address(),
						// 	})
						// })
						.on('close', () => info(u.white(`WS has closed`)))
						.on('error', (err) => info(u.red(`[${err.name}] ${err.message}`)))

				function sendMessage(msg: Record<string, any>) {
					return new Promise((resolve, reject) => {
						wss &&
							wss.clients.forEach((client) => {
								client.send(JSON.stringify(msg, null, 2), (err) => {
									if (err) reject(err)
									else resolve(undefined)
								})
							})
					})
				}

				function getFileName(path: string) {
					path.includes('/') &&
						(path = path.substring(path.lastIndexOf('/') + 1))
					return ensurePageName(path)
				}

				function onWatchEvent(
					type: string,
					fn: (args: {
						isFile: boolean
						isFolder: boolean
						name: string
						path: string
						stats: fs.Stats
					}) => void,
				) {
					async function onEvent(path: string) {
						const stats = await fs.stat(path)
						const args = {
							isFile: stats.isFile(),
							isFolder: stats.isDirectory(),
							name: ensurePageName(getFileName(path)),
							path,
							// stats,
						} as Parameters<typeof fn>[0]
						sendMessage({ type, ...args })
						fn(args)
					}
					return onEvent
				}

				watch
					.on('ready', () => {
						info(
							`Watching for file changes at ${u.green(this.options.serverDir)}`,
						)
						sendMessage({ type: c.WATCHING_FILES })
					})
					.on(
						'change',
						onWatchEvent(c.FILE_CHANGED, (args) =>
							info(`File changed`, u.magenta(path.resolve(args.path))),
						),
					)
					.on(
						'add',
						onWatchEvent(c.FILE_ADDED, (args) => {
							info(`File added`, u.magenta(path.resolve(args.path)))
							if (isYml(args.path)) {
								let filepath = path.resolve(args.path)
								let filename = args.path
								isYml(filename) && (filename = filename.replace('.yml', ''))
								if (filename.split('/')?.length > 2) {
									filename = filename.substring(filename.lastIndexOf('/'))
								}
								info(u.white(`Added new route: ${u.magenta(filename)}`))
								server &&
									server?.get(
										this.getRoutes({
											ext: 'yml',
											filepath,
											filename,
											group: 'page',
										}),
										(req, res) => res.send(loadFile(filepath)),
									)
							}
						}),
					)
					.on(
						'addDir',
						onWatchEvent(c.FOLDER_ADDED, (args) =>
							info(`Folder added`, u.magenta(path.resolve(args.path))),
						),
					)
					.on(
						'unlink',
						onWatchEvent(c.FILE_REMOVED, (args) =>
							info(`File was removed`, u.magenta(path.resolve(args.path))),
						),
					)
					.on(
						'unlinkDir',
						onWatchEvent(c.FOLDER_REMOVED, (args) =>
							info(`Folder was removed`, u.magenta(path.resolve(args.path))),
						),
					)
					.on('error', (err) => {
						info(`Error`, err)
						sendMessage({ type: c.WATCH_ERROR, error: err })
					})
			})
	}

	/**
	 * @param { Partial<RootConfig> } configObject
	 * Parses the config provided, returning a parsed object where placeholders
	 * are replaced
	 */
	parseConfig(rootConfig: RootConfig): RootConfig
	parseConfig(appConfig: AppConfig, rootConfig: RootConfig): AppConfig
	parseConfig(
		configObject1?: RootConfig | AppConfig,
		configObject2?: RootConfig,
	) {
		// Root config
		if (u.isUnd(configObject2)) {
			configObject1 = configObject1 as RootConfig
			return JSON.parse(
				createPlaceholderReplacers(
					[
						['${cadlBaseUrl}', this.#cadlBaseUrl],
						['${cadlVersion}', this.getConfigVersion(configObject1)],
					],
					'g',
				)(
					JSON.stringify({
						...configObject1,
						webApiHost:
							configObject1.webApiHost === 'apiHost'
								? configObject1.apiHost
								: configObject1.webApiHost,
						appApiHost:
							configObject1.appApiHost === 'apiHost'
								? configObject1.apiHost
								: configObject1.appApiHost,
						cadlBaseUrl:
							configObject1.cadlBaseUrl || c.DEFAULT_CONFIG_BASEE_URL,
						loadingLevel: u.isNum(configObject1.loadingLevel)
							? configObject1.loadingLevel
							: 1,
						debug: configObject1.debug || c.DEFAULT_CONFIG_DEBUG,
					}),
				),
			) as RootConfig
		}

		return JSON.parse(
			createPlaceholderReplacers(
				[
					['${cadlBaseUrl}', this.#cadlBaseUrl],
					['${cadlVersion}', this.getConfigVersion(configObject2)],
				],
				'g',
			)(u.isStr(configObject1) ? configObject1 : JSON.stringify(configObject1)),
		) as AppConfig
	}

	getConfigVersion(configObject?: RootConfig) {
		if (this.options.version === 'latest') {
			return get(
				configObject || {},
				`${this.options.deviceType || 'web'}.cadlVersion.${
					this.options.env || 'test'
				}`,
			)
		}
		return this.options.version
	}
}

export = NoodlWebpackPlugin
