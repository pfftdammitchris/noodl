import * as u from '@jsmanifest/utils'
import invariant from 'invariant'
import { RootConfig, AppConfig } from 'noodl-types'
import { SetRequired } from 'type-fest'
import { Document, parse as parseToJson, parseDocument, stringify } from 'yaml'
import { Compiler } from 'webpack'
import get from 'lodash/get'
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
	isYml,
	request,
} from './utils'
import * as t from './types'
import * as c from './constants'

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
	serverDir?: string
	serverPort?: number | string
	version?: 'latest' | number
	wssPort?: number | string
}

const pluginName = 'noodl-webpack-plugin'
const tag = `[${u.cyan(pluginName)}]`
const info = (s1: string, ...s2: any[]) => u.log(`${tag} ${s1}`, ...s2)
const getAbsPath = (...s: string[]) =>
	path.resolve(path.join(process.cwd(), ...s))

class NoodlWebpackPlugin {
	#rootConfigObject: RootConfig | undefined
	#appConfigObject: AppConfig | undefined
	#cadlBaseUrl = ''
	#nativeCadlBaseUrl = ''
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
			serverDir = c.DEFAULT_SERVER_PATH,
			serverPort = c.DEFAULT_SERVER_PORT,
			staticPaths,
			wssPort = c.DEFAULT_WSS_PORT,
			version = c.DEFAULT_CONFIG_VERSION,
		} = options

		invariant(!!config, `A config value is required`)

		this.options.config = config
		this.options.deviceType = deviceType
		this.options.env = env
		this.options.hostname = hostname
		this.options.locale = locale
		this.options.serverDir = getAbsPath(serverDir)
		this.options.serverPort = serverPort
		this.options.staticPaths = staticPaths || []
		this.options.version = version
		this.options.wssPort = wssPort
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

		let {
			config,
			deviceType,
			env,
			hostname,
			locale,
			serverPort,
			serverDir,
			staticPaths,
			version,
		} = this.options

		if (!(await fs.pathExists(serverDir))) {
			await fs.ensureDir(serverDir)
			info(`Created folder for server: ${u.yellow(serverDir)}`)
		}

		u.newline()

		info(
			`Searching your directory for the config (${u.yellow(config)}) file...`,
		)

		let localFiles = await globby(path.join(serverDir, '**/*'), {
			expandDirectories: true,
			onlyFiles: true,
		})

		let configRegEx = new RegExp(`(${this.config}|${this.config}.yml)`, 'i')
		let configFilePath = localFiles.find((path) => configRegEx.test(path))
		let configVersion = ''

		if (configFilePath) {
			try {
				info(`Found ${u.yellow(configFilePath)}`)
				// Purge root config (populates other props in this instance)
				this.parseConfig(parseToJson(loadFile(configFilePath)))
				info(`Parsed root config`)
			} catch (error) {
				console.error(u.red(`[${error.name}] ${error.message}`))
			}
		} else {
			throw new Error(
				`Config "${u.yellow(config)}" is not found in ${u.yellow(serverDir)}`,
			)
			// info(
			// 	`Config file not found. ` +
			// 		`Downloading remotely and saving it to your folder...`,
			// )
			// // Prompt first time config
			// // Else use saved config as default
			// configYml = (await request(
			// 	`https://public.aitmed.com/config/${config}.yml`,
			// )) as string

			// configRemotelyFetched = true

			// info(`Received config in (YML)`)

			// configDoc = parseDocument(configYml)

			// try {
			// 	const configFileName = `${config}.yml`
			// 	await fs.writeFile(
			// 		path.join(serverDir, configFileName),
			// 		stringify(configDoc),
			// 		'utf8',
			// 	)
			// 	info(`Created and saved ${u.yellow(configFileName)} to your dir`)
			// } catch (error) {
			// 	console.error(u.red(`[${error.name}] ${error.message}`))
			// }
		}

		info(
			`Loading the config using ${u.yellow(deviceType)} with version ` +
				`${u.yellow(String(version))} in ${u.yellow(String(env))} ` +
				`environment (You can change these settings by passing them into the plugin's options)`,
		)

		let appConfig: AppConfig
		let appConfigYml = ''
		let appConfigUrl = ''

		configVersion = this.getConfigVersion(this.#rootConfigObject)

		info(
			`Selected version: ${u.yellow(configVersion)}${
				version === 'latest' ? ` (${u.yellow('latest')})` : ''
			}`,
		)

		// appConfigUrl =
		// 	`${c.DEFAULT_CONFIG_BASEE_URL}/cadl/${config}_${configVersion}` +
		// 	`/${this.#rootConfigObject.cadlMain}`

		info(`appApiHost: ${u.yellow(this.#rootConfigObject.appApiHost)}`)
		info(`apiHost: ${u.yellow(this.#rootConfigObject.apiHost)}`)
		info(`apiPort: ${u.yellow(this.#rootConfigObject.apiPort)}`)
		info(`cadlBaseUrl: ${u.yellow(this.#cadlBaseUrl)}`)
		info(`webApiHost: ${u.yellow(this.#rootConfigObject.webApiHost)}`)

		if (this.#rootConfigObject.myBaseUrl) {
			info(`myBaseUrl: ${u.yellow(this.#rootConfigObject.myBaseUrl)}`)
		}

		if (this.#rootConfigObject.timestamp) {
			info(`timestamp: ${u.yellow(this.#rootConfigObject.timestamp)}`)
		}

		const appConfigFilePath = localFiles.find((filepath) =>
			filepath.startsWith(this.#rootConfigObject.cadlMain),
		)

		if (appConfigFilePath) {
			info(`Loading app config...`)
			appConfigYml = loadFile(appConfigFilePath)
		} else {
			info(
				`Missing app config file (${u.yellow(
					this.#rootConfigObject.cadlMain,
				)}) from the dir. Fetching remotely now...`,
			)

			// TODO - Fetch native root config if current cadlBaseUrl is local, and save it to this.#nativeRootConfigUrl

			if (/(127.0.0.1|localhost)/i.test(this.#cadlBaseUrl)) {
				info(
					`Fetching for a fresh root config object to retrieve the original hostname`,
				)

				// Fetch a fresh config remotely and get the real cadlBaseUrl
				const nativeRootConfigYml = (await request(
					`https://public.aitmed.com/config/${config}.yml`,
				)) as string

				if (nativeRootConfigYml) {
					const nativeRootConfigObject = parseToJson(nativeRootConfigYml)
					const nativeCadlBaseUrl = nativeRootConfigObject.cadlBaseUrl

					if (u.isObj(nativeRootConfigObject)) {
						appConfigUrl =
							nativeCadlBaseUrl.replace(
								new RegExp('\\${cadlVersion}', 'g'),
								configVersion,
							) + nativeRootConfigObject.cadlMain
					} else {
						u.red(
							`Could not read from the remote root (${u.yellow(
								config,
							)}) config. Something went wrong.`,
						)
					}
				} else {
					u.red(
						`Could not fetch a fresh root config object remotely because the data ` +
							`received was empty or invalid`,
					)
				}
			}

			if (!/(127.0.0.1|localhost)/i.test(appConfigUrl)) {
				appConfigYml = (await request(appConfigUrl)) as string
			} else {
				console.error(
					`Tried one or more times to remotely fetch the original app config ` +
						`but the ${u.yellow(
							`cadlBaseUrl`,
						)} is not a valid remote config url`,
				)
			}
		}

		if (appConfigYml) info(`App config was retrieved as YAML`)
		else console.error(`Could not load the app config YAML`)

		appConfig = parseToJson(appConfigYml)

		const preloadPages = (appConfig.preload as string[]) || []
		const pages = (appConfig.page as string[]) || []
		const allPages = [...preloadPages, ...pages]

		if (appConfig) {
			appConfig = this.parseConfig(appConfig, rootConfigObject)
			info(`App config (${u.yellow(rootConfigObject.cadlMain)}) was parsed`)
			info(`assetsUrl: ${u.yellow(appConfig.assetsUrl)}`)
			info(`baseUrl: ${u.yellow(appConfig.baseUrl)}`)
			info(`startPage: ${u.yellow(appConfig.startPage)}`)
			info(
				`There are ${u.yellow(
					String(preloadPages.length),
				)} preload pages in the config`,
			)
			info(`There are ${u.yellow(String(pages.length))} pages in the config`)
			info(
				`Total ${u.yellow(
					String(preloadPages.length + pages.length),
				)} pages in total`,
			)
		} else {
			u.red(
				`Could not load the app config object. Either there was a YAML parsing error ` +
					`or the YAML file could not be retrieved for an unknown reason`,
			)
		}

		info(`Scanning for missing files...`)

		const localFilesAsFileNames = [] as string[]

		localFiles.forEach((filepath) => {
			const metadata = getMetadataObject(filepath, { config })
			const filename = (
				metadata.filepath.indexOf('/') > -1
					? metadata.filepath.substring(metadata.filepath.lastIndexOf('/') + 1)
					: metadata.filepath
			).replace(/(~\/|_en|.yml)/gi, '')
			localFilesAsFileNames.push(filename)
		})

		const missingFilesPromises = [] as Promise<
			t.MetadataObject & { url: string; yml: string }
		>[]

		const replacePlaceholders = createPlaceholderReplacers(
			[
				['${cadlBaseUrl}', this.#cadlBaseUrl],
				['${cadlVersion}', this.getConfigVersion(rootConfigObject)],
			],
			'g',
		)

		for (const page of [...allPages, rootConfigObject.cadlMain]) {
			if (!localFilesAsFileNames.includes(page)) {
				missingFilesPromises.push(
					new Promise(async (resolve) => {
						const ext = 'yml'
						const filename = page.startsWith('~/')
							? page.replace('~/', '')
							: page
						const filenameWithSuffix = `${filename}_en.${ext}`
						const downloadLink = replacePlaceholders(
							`${rootConfigObject.cadlBaseUrl}${filenameWithSuffix}`,
						)
						const missingFile = {
							ext,
							filename,
							filepath: path.resolve(path.join(serverDir, filenameWithSuffix)),
							group: 'page',
							url: downloadLink,
							yml: (await request(downloadLink)) as string,
						} as t.MetadataObject & { url: string; yml: string }
						resolve(missingFile)
					}),
				)
			}
		}

		let missingFilesDownloadCounter = 0

		if (missingFilesPromises.length) {
			info(
				`Downloading ${u.yellow(
					String(missingFilesPromises.length),
				)} missing files`,
			)
			const missingFiles = await Promise.all(missingFilesPromises)
			u.newline()
			for (const missingFile of missingFiles) {
				info(`Saved missing page ${u.magenta(missingFile.filename)}`)
				await fs.writeFile(missingFile.filepath, missingFile.yml, 'utf8')
				missingFilesDownloadCounter++
			}
			u.newline()
			info(
				`Finished downloading ${u.yellow(
					String(missingFilesDownloadCounter),
				)} of ${u.yellow(String(missingFilesPromises.length))} missing files`,
			)
			u.newline()
		}

		/**
		 * 1. Scan all files
		 * 2. Separate config files from non-config files
		 */

		// if (localFiles.length) {
		// 	info(
		// 		`Loading ${u.yellow(
		// 			String(localFiles.length),
		// 		)} files mentioned in ${u.green(`${this.config}.yml`)}`,
		// 	)
		// } else {
		// 	info(`No local files found in ${u.yellow(serverDir)}`)
		// }

		// const missingPages = [] as t.File[]

		// for (const filepath of localFiles) {
		// 	if (!filepath?.includes('.')) continue
		// 	if (/\/assets?/i.test(filepath)) {
		// 		this.#assets.push(getMetadataObject(filepath))
		// 	} else if (isYml(filepath)) {
		// 		this.#yml.push(getMetadataObject(filepath, { config: this.config }))
		// 	} else {
		// 		this.#other.push(filepath)
		// 	}
		// }

		this.listen({
			server: (this.#server = express() as express.Express),
			wss: (this.#wss = new WebSocket.Server({
				host: this.options.hostname,
				port: Number(this.options.wssPort),
			})),
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
		server: express.Express
		wss: WebSocket.Server
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
					const route = server.get(
						(routes = this.getRoutes(obj)),
						(req, res, next) => {
							res.send(loadFile(obj.filepath))
							next()
						},
					)
				}
			}
			return register
		}

		server.use(express.static(this.options.serverDir))

		for (const obj of this.options.staticPaths) {
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

		server.listen(this.options.serverPort, () => {
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
				.on('close', () => info(u.white(`WS has closed`)))
				.on('error', (err) => info(u.red(`[${err.name}] ${err.message}`)))

			function sendMessage(msg: Record<string, any>) {
				return new Promise((resolve, reject) => {
					wss.clients.forEach((client) => {
						client.send(JSON.stringify(msg, null, 2), (err) => {
							if (err) reject(err)
							else resolve(undefined)
						})
					})
				})
			}

			function getFileName(path: string) {
				path.includes('/') && (path = path.substring(path.lastIndexOf('/') + 1))
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

	purgePlaceholders(value: string) {
		return createPlaceholderReplacers(
			[
				['${cadlBaseUrl}', this.#cadlBaseUrl],
				['${cadlVersion}', this.getConfigVersion(rootConfigObject)],
			],
			'g',
		)(value)
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
			configObject1 = JSON.parse(
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
			this.#cadlBaseUrl = configObject1.cadlBaseUrl
			this.#rootConfigObject = configObject1
			return this.#rootConfigObject
		}

		configObject1 = JSON.parse(
			createPlaceholderReplacers(
				[
					['${cadlBaseUrl}', this.#cadlBaseUrl],
					['${cadlVersion}', this.getConfigVersion(configObject2)],
				],
				'g',
			)(u.isStr(configObject1) ? configObject1 : JSON.stringify(configObject1)),
		) as AppConfig

		this.#appConfigObject = configObject1
		return this.#appConfigObject
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
