import { Compiler } from 'webpack'
import * as u from '@jsmanifest/utils'
import WebSocket from 'ws'
import fs from 'fs-extra'
import globby from 'globby'
import chokidar from 'chokidar'
import express from 'express'
import {
	createMetadataExtractor,
	getExt,
	getFilePath,
	loadFile,
	isYml,
	MetadataObject,
} from './utils'
import * as c from './constants'

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

class NoodlWebpackPlugin {
	options = {} as Required<Options>
	server: express.Express
	watch: chokidar.FSWatcher
	wss: WebSocket.Server

	static pluginName = 'noodl-webpack-plugin'

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
		this.server = express()

		for (const obj of this.options.staticPaths) {
			this.server.get(this.getRoutes(obj.name), obj.fn)
		}

		const getFilePathMetadata = createMetadataExtractor('filepath')
		const localFiles = globby.sync(this.options.serverPath)
		const assets = [] as MetadataObject[]
		const yml = [] as MetadataObject[]

		for (const filepath of localFiles) {
			if (fs.statSync(filepath).isFile() && filepath.includes('/assets')) {
				assets.push(getFilePathMetadata(filepath))
			} else {
				yml.push(getFilePathMetadata(filepath))
			}
		}

		yml.forEach(({ group, filepath, filename }, i) => {
			!filename.startsWith('/') && (filename = `/${filename}`)
			isYml(filename) && (filename = filename.replace('.yml', ''))
			yml[i].group = 'page'
			u.log(
				u.white(
					`Registering ${u.yellow(group)} pathname: ${u.magenta(
						filename,
					)} filepath: ${filepath}`,
				),
			)
			this.server.get(this.getRoutes(filename), (req, res) =>
				res.send(loadFile(filepath)),
			)
		})

		assets.forEach(({ group, filepath, filename }) => {
			!filename.startsWith('/') && (filename = `/${filename}`)
			u.log(
				u.white(
					`Registering ${u.yellow(group)} pathname: ${u.magenta(
						filename,
					)} filepath: ${filepath}`,
				),
			)
			this.server.get(
				[filename, `/assets/${filename.replace('/', '')}`],
				(req, res) => res.sendFile(filepath),
			)
		})

		this.listen({
			server: this.server,
			wss: (this.wss = new WebSocket.Server({
				host: this.options.hostname,
				port: Number(this.options.wssPort),
			})),
			watch: (this.watch = chokidar.watch(getFilePath('server/**/*'), {
				cwd: process.cwd(),
				followSymlinks: true,
				ignoreInitial: true,
			})),
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

		server.listen(this.options.serverPort, () => {
			u.log(
				`\n\n${comet}   Server ready at ${u.cyan(`${this.serverUrl}`)} ` +
					`${this.options.config ? `using config ${tags.config}` : ''}`,
			)
			wss
				.on('listening', () =>
					u.log(
						`${croissant}  ` +
							`WebSocket server is listening at: ` +
							`${tags.ws}:${tags.slash} ${tags.host}:${tags.port}`,
					),
				)
				.on('connection', (ws, { socket }) => {
					// prettier-ignore
					u.log(`\n${u.green(`Client is connected: ${u.cyan(socket.remoteAddress)}`)}`)
					ws.on('message', (message) => u.log('Received: %s', message))
				})
				.on('close', () => u.log(u.white(`WebSocket server has closed`)))
				.on('error', (err) => u.log(u.red(`[${err.name}] ${err.message}`)))

			function sendMessage(msg) {
				return new Promise((resolve, reject) => {
					wss.clients.forEach((client) => {
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
						stats,
					} as Parameters<typeof fn>[0]
					sendMessage({ type, ...args })
					fn(args)
				}
				return onEvent
			}

			watch
				.on('ready', () => {
					u.log(
						`${tags.watch} Watching for file changes at ${u.magenta(
							this.options.serverPath,
						)}`,
					)
					sendMessage({ type: c.WATCHING_FILES })
				})
				.on(
					'change',
					onWatchEvent(c.FILE_CHANGED, (args) =>
						u.log(`${tags.watch} file changed`, args.path),
					),
				)
				.on(
					'add',
					onWatchEvent(c.FILE_ADDED, (args) => {
						u.log(`${tags.watch} file added`, args.path)
						if (isYml(args.path)) {
							let filepath = args.path
							let filename = filepath
							!filename.startsWith('/') && (filename = `/${filename}`)
							isYml(filename) && (filename = filename.replace('.yml', ''))
							if (filename.split('/').length > 2) {
								filename = filename.substring(filename.lastIndexOf('/'))
							}
							u.log(u.white(`Registering new rofute: ${u.magenta(filename)}`))
							const routes = [filename, `${filename}.yml`, `${filename}_en.yml`]
							server.get(routes, (req, res) => res.send(loadFile(filepath)))
						}
					}),
				)
				.on(
					'addDir',
					onWatchEvent(c.FOLDER_ADDED, (args) =>
						u.log(`${tags.watch} folder added`, args.path),
					),
				)
				.on(
					'unlink',
					onWatchEvent(c.FILE_REMOVED, (args) =>
						u.log(`${tags.watch} file was removed`, args.path),
					),
				)
				.on(
					'unlinkDir',
					onWatchEvent(c.FOLDER_REMOVED, (args) =>
						u.log(`${tags.watch} folder was removed`, args.path),
					),
				)
				.on('error', (err) => {
					u.log(`${tags.watch} error`, err)
					sendMessage({ type: c.WATCH_ERROR, error: err })
				})
		})
	}
}

export default NoodlWebpackPlugin
