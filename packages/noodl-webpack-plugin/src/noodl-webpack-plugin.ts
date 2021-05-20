import { Compiler } from 'webpack'
import * as u from '@jsmanifest/utils'
import WebSocket from 'ws'
import globby from 'globby'
import chokidar from 'chokidar'
import express from 'express'
import fs from 'fs-extra'
import path from 'path'
import {
	createMetadataExtractor,
	getExt,
	getFilePath,
	loadFile,
	isYml,
	MetadataObject,
} from './utils'
import * as c from './constants'

export { c as constants }

export interface Options {
	config?: string
	hostname?: string
	locale?: string
	staticPaths?: {
		name: string
		fn: express.RequestHandler
	}[]
	serverPath?: string
	serverPort?: number | string
	wssPort?: number | string
}

const pluginName = 'noodl-webpack-plugin'
const tag = `[${u.cyan(pluginName)}]`
const info = (s1: string, ...s2: any[]) => u.log(`${tag} ${s1}`, ...s2)

let tappedCounter = 0

class NoodlWebpackPlugin {
	options = {} as Required<Options>
	server: express.Express | undefined
	watch: chokidar.FSWatcher | undefined
	wss: WebSocket.Server | undefined

	static pluginName = pluginName

	constructor(options?: Partial<Options>) {
		this.options.config = options?.config || c.DEFAULT_CONFIG
		this.options.hostname = options?.hostname || c.DEFAULT_HOSTNAME
		this.options.locale = options?.locale || c.DEFAULT_LOCALE
		this.options.serverPath = options?.serverPath || c.DEFAULT_SERVER_PATH
		this.options.serverPort = options?.serverPort || c.DEFAULT_SERVER_PORT
		this.options.wssPort = options?.wssPort || c.DEFAULT_WSS_PORT
		this.options.staticPaths = options?.staticPaths || []
	}

	get config() {
		return this.options.config
	}

	set config(config) {
		this.options.config = config
	}

	get serverUrl() {
		return `http://${this.options.hostname}:${this.options.serverPort}`
	}

	get wssUrl() {
		return `ws://${this.options.hostname}:${this.options.wssPort}`
	}

	apply(compiler: Compiler) {
		// prettier-ignore
		info(`\n\n${u.white(
			`Entered the plugins "apply" lifecycle ${++tappedCounter} time(s)`,
		)}\n`)

		const settings = this.options

		info(`Config: ${u.green(settings.config)}`)
		info(`Server path: ${u.green(settings.serverPath)}`)
		info(`Server port: ${u.green(String(settings.serverPort))}`)
		info(`Server url: ${u.green(this.serverUrl)}`)
		info(`Websocket port: ${u.green(String(settings.wssPort))}`)

		u.newline()

		for (const obj of this.options.staticPaths) {
			this.server?.get(this.getRoutes(obj.name), obj.fn)
		}

		const getFilePathMetadata = createMetadataExtractor('filepath')
		const isAssetPath = (s: string) => /\/assets?/i.test(s)
		const localFiles = globby?.sync(this.options.serverPath, {
			onlyFiles: true,
		})
		const assets = [] as MetadataObject[]
		const yml = [] as MetadataObject[]
		const other = [] as any[]

		if (localFiles.length) {
			info(`Processing ${u.magenta(String(localFiles.length))} files`)
		} else {
			info(`No local files found in the server dir`)
		}

		for (const filepath of localFiles) {
			// if (fs.statSync(filepath).isFile() && filepath.includes('/assets')) {
			if (isAssetPath(filepath)) {
				assets.push(getFilePathMetadata(filepath))
			} else if (isYml(filepath)) {
				yml.push(getFilePathMetadata(filepath))
			} else {
				other.push(filepath)
			}
		}

		const registerRoute = (type: 'asset' | 'page') => {
			const fn = (obj: MetadataObject) => {
				let filename = obj.filename

				!filename.startsWith('/') && (filename = `/${filename}`)

				if (type === 'asset') {
					//
				} else {
					isYml(filename) && (filename = filename.replace('.yml', ''))
					obj.group = 'page'
				}

				info(
					u.white(
						`Registering ${u.yellow(obj.group)} pathname: ${u.magenta(
							filename,
						)} filepath: ${obj.filepath}`,
					),
				)

				if (type === 'asset') {
					this.server?.get(
						[filename, `/assets/${filename.replace('/', '')}`],
						(req, res) => res.sendFile(obj.filepath),
					)
				} else {
					this.server?.get(this.getRoutes(filename), (req, res) => {
						res.send(loadFile(obj.filepath))
					})
				}
			}
			return fn
		}

		const handleAssetRoute = registerRoute('asset')
		const handlePageRoute = registerRoute('page')

		assets.forEach(handleAssetRoute)
		yml.forEach(handlePageRoute)

		this.listen({
			server: this.server,
			wss: (this.wss = new WebSocket.Server({
				host: this.options.hostname,
				port: Number(this.options.wssPort),
			})),
			watch: (this.watch = chokidar.watch(
				path.join(this.options.serverPath, '**/*'),
				{ cwd: process.cwd(), ignoreInitial: true },
			)),
		})
	}

	getRoutes(name: string) {
		const paths = [`/${name}`]
		if (name.includes('.') && !name.endsWith('.')) {
			const ext = getExt(name)
			paths.push(`/${name}.${ext}`)
			if (ext === 'yml') paths.push(`/${name}${this.options.locale}.${ext}`)
		}
		return paths as [string, string, string]
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
	}: Pick<NoodlWebpackPlugin, 'server' | 'watch' | 'wss'>) {
		const comet = '\u2604\uFE0F'
		const croissant = '\uD83D\uDE48'

		const tags = {
			ws: u.cyan('ws'),
			host: `[${this.options.hostname}]`,
			port: u.green(String(this.options.serverPort)),
			slash: u.cyan('//'),
			config: u.yellow(this.options.config),
			watch: `[${u.cyan(`watch`)}]`,
		}

		server?.listen(this.options.serverPort, () => {
			info(
				`\n\n${comet}   Server ready at ${u.cyan(`${this.serverUrl}`)} ` +
					`${this.options.config ? `using config ${tags.config}` : ''}`,
			)
			wss
				?.on('listening', () =>
					info(
						`${croissant}  ` +
							`WebSocket server is listening at: ` +
							`${tags.ws}:${tags.slash} ${tags.host}:${tags.port}`,
					),
				)
				.on('connection', (ws, { socket }) => {
					// prettier-ignore
					info(`\n${u.green(`Client is connected: ${u.cyan(socket.remoteAddress as string)}`)}`)
					ws.on('message', (message) => info('Received: %s', message))
				})
				.on('close', () => info(u.white(`WebSocket server has closed`)))
				.on('error', (err) => info(u.red(`[${err.name}] ${err.message}`)))

			function sendMessage(msg) {
				return new Promise((resolve, reject) => {
					wss?.clients.forEach((client) => {
						client.send(JSON.stringify(msg, null, 2), (err) => {
							if (err) reject(err)
							else resolve(undefined)
						})
					})
				})
			}

			function getFileName(path) {
				path.includes('/') && (path = path.substring(path.lastIndexOf('/') + 1))
				isYml(path) && (path = path.substring(0, path.lastIndexOf('.yml')))
				return path
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
					const stats = await fs.stat(getFilePath(path))
					const args = {
						isFile: stats.isFile(),
						isFolder: stats.isDirectory(),
						name: getFileName(path),
						path,
						// stats,
					} as Parameters<typeof fn>[0]
					sendMessage({ type, ...args })
					fn(args)
				}
				return onEvent
			}

			watch
				?.on('ready', () => {
					info(
						`${tags.watch} Watching for file changes at ${u.magenta(
							this.options.serverPath,
						)}`,
					)
					sendMessage({ type: c.WATCHING_FILES })
				})
				.on(
					'change',
					onWatchEvent(c.FILE_CHANGED, (args) =>
						info(`${tags.watch} file changed`, args.path),
					),
				)
				.on(
					'add',
					onWatchEvent(c.FILE_ADDED, (args) => {
						info(`${tags.watch} file added`, args.path)
						if (isYml(args.path)) {
							let filepath = args.path
							let filename = filepath
							!filename.startsWith('/') && (filename = `/${filename}`)
							isYml(filename) && (filename = filename.replace('.yml', ''))
							if (filename.split('/')?.length > 2) {
								filename = filename.substring(filename.lastIndexOf('/'))
							}
							info(u.white(`Added new route: ${u.magenta(filename)}`))
							const routes = [filename, `${filename}.yml`, `${filename}_en.yml`]
							server.get(routes, (req, res) => res.send(loadFile(filepath)))
						}
					}),
				)
				.on(
					'addDir',
					onWatchEvent(c.FOLDER_ADDED, (args) =>
						info(`${tags.watch} folder added`, args.path),
					),
				)
				.on(
					'unlink',
					onWatchEvent(c.FILE_REMOVED, (args) =>
						info(`${tags.watch} file was removed`, args.path),
					),
				)
				.on(
					'unlinkDir',
					onWatchEvent(c.FOLDER_REMOVED, (args) =>
						info(`${tags.watch} folder was removed`, args.path),
					),
				)
				.on('error', (err) => {
					info(`${tags.watch} error`, err)
					sendMessage({ type: c.WATCH_ERROR, error: err })
				})
		})
	}
}

export default NoodlWebpackPlugin
