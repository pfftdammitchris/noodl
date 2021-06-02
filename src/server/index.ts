import { ApolloServer, ApolloServerExpressConfig } from 'apollo-server-express'
import { ApolloServerPlugin } from 'apollo-server-plugin-base'
import * as u from '@jsmanifest/utils'
import chokidar from 'chokidar'
import path from 'path'
import express from 'express'
import fs from 'fs-extra'
import WebSocket from 'ws'
import globby from 'globby'
import createAggregator from '../api/createAggregator'
import emitResolvers from './resolvers/emit.resolvers'
import typeDefs from '../generated/typeDefs'
import { MetadataFileObject } from '../types'
import * as co from '../utils/color'
import * as com from '../utils/common'

const log = console.log

interface Options {
	aggregator?: ReturnType<typeof createAggregator>
	config: string
	dir: string
	host?: string
	port?: number
	protocol?: string
	wss?: boolean
}

const configureServer = (function () {
	const remoteSettings = {
		rootUrl: 'https://public.aitmed.com/config',
	}

	const plugin: ApolloServerPlugin = {
		serverWillStart(service) {
			//
		},
		requestDidStart(reqContext) {
			return {
				executionDidStart(reqContext) {
					//
				},
				async responseForOperation(reqContext) {
					log('reqContext', reqContext)
					return {
						...reqContext.response,
						fruits: ['apple'],
					}
				},
				willSendResponse(reqContext) {
					// return {
					// 	hello: 'hehe',
					// }
				},
			}
		},
	}

	const o = {
		async copyFilesTo(filepaths: string[], to: string) {
			const [copied, failed] = await com.promiseAllSafelySplit(
				...filepaths.map((filepath) =>
					Promise.resolve(fs.copyFile(filepath, to)),
				),
			)
			if (failed.length) {
				log(
					`\n${copied.length} files were copied over but ` +
						`${co.magenta(failed.length)} files failed\n`,
				)
			}
		},
		loadFile(filepath: string) {
			return fs.readFileSync(filepath, 'utf8')
		},
	}

	return async function createServer({
		aggregator,
		config = '',
		dir = '',
		host = 'localhost',
		port = 3001,
		protocol = 'http',
		wss: enableWss = false,
	}: Options) {
		if (!config) throw new Error('A config (name) must be set')
		if (!dir) throw new Error(`Please provide a directory for the server`)
		dir = path.resolve(dir)

		!aggregator && (aggregator = createAggregator({ config }))

		const serverUrl = `${protocol}://${host}:${port}`
		const localFiles = globby.sync(dir)
		let wss: WebSocket.Server | undefined

		const metadata = localFiles.reduce(
			(acc, filepath) => {
				const stat = fs.statSync(filepath)
				if (stat.isFile()) {
					if (filepath.includes('/assets')) {
						acc.assets.push(
							com.createFileMetadataExtractor(filepath, { config }),
						)
					} else {
						acc.yml.push(com.createFileMetadataExtractor(filepath, { config }))
					}
				}
				return acc
			},
			{ assets: [] as MetadataFileObject[], yml: [] as MetadataFileObject[] },
		)

		const options: ApolloServerExpressConfig = {
			typeDefs,
			resolvers: {
				Query: { ...emitResolvers.Query },
				Mutation: { ...emitResolvers.Mutation },
			},
			context({ req }) {
				return {
					baseUrl: req.baseUrl,
					body: req.body,
					hostname: req.hostname,
					ip: req.ip,
					path: req.path,
					params: req.params,
					pathname: req.route,
					url: req.url,
				}
			},
			playground: {
				settings: {
					'editor.fontFamily': 'Fira Code Retina',
					'editor.fontSize': 11.5,
					'editor.theme': 'dark',
				},
				codeTheme: {
					property: 'rgb(56, 189, 193)',
				},
			},
			plugins: [plugin],
		}

		const graphqlServer = new ApolloServer(options)
		const app = express()

		app.get(
			['/HomePageUrl', '/HomePageUrl_en.yml', '/HomePageUrl.yml'],
			(req, res) => res.send(''),
		)

		app.get(
			['/cadlEndpoint', '/cadlEndpoint.yml', '/cadlEndpoint_en.yml'],
			(req, res) => res.sendFile(path.join(dir, 'cadlEndpoint.yml')),
		)

		metadata.yml.forEach(({ group, filepath, filename }) => {
			!filename.startsWith('/') && (filename = `/${filename}`)
			filename.endsWith('.yml') && (filename = filename.replace('.yml', ''))
			group = 'page' as any
			log(
				co.white(
					`Registering route: ${co.yellow(filename)} [${co.magenta(group)}]`,
				),
			)
			const routes = [filename, `${filename}.yml`, `${filename}_en.yml`]
			app.get(routes, (req, res) => {
				res.send(o.loadFile(filepath))
			})
		})

		metadata.assets.forEach(({ group, filepath, filename }) => {
			if (!filename.startsWith('/')) filename = `/${filename}`
			log(
				co.white(
					`Registering route: ${co.yellow(filename)} [${co.magenta(group)}]`,
				),
			)
			const routes = [filename, `/assets/${filename.replace('/', '')}`]
			app.get(routes, (req, res) => {
				res.sendFile(filepath)
			})
		})

		graphqlServer.applyMiddleware({ app })

		app.listen({ cors: { origin: '*' }, port }, () => {
			log(
				`\n🚀 Server ready at ${co.cyan(`${serverUrl}`)} ${
					config ? `using config ${co.yellow(config)}` : ''
				}`,
			)

			if (enableWss) {
				const wssPort = 3002
				wss = new WebSocket.Server({ host, port: wssPort })

				wss.on('listening', () => {
					log(
						`🚀 WebSocket server is listening at: ${co.cyan(
							`ws://${host}:${wssPort}`,
						)}`,
					)
				})

				wss.on('connection', function connection(ws, sender) {
					const { socket } = sender
					const ip = socket.remoteAddress

					u.newline()
					log(co.brightGreen(`Client is connected`), {
						ip: socket.remoteAddress,
					})
					ws.on('message', (message) => log('Received: %s', message))
					ws.send(
						'Hello client. I am the WebSocket server you are connected to!',
					)
				})

				wss.on('close', () => log(co.white(`WebSocket server has closed`)))
				wss.on('error', (err) => log(co.red(`[${err.name}] ${err.message}`)))
			}

			const tag = `[${co.cyan(`watcher`)}]`

			function sendMessage(msg: Record<string, any>) {
				return new Promise((resolve, reject) => {
					wss?.clients.forEach((client) => {
						client.send(JSON.stringify(msg, null, 2), (err) => {
							if (err) reject(err)
							else resolve(undefined)
						})
					})
				})
			}

			const getFileName = (path: string) => {
				path.includes('/') && (path = path.substring(path.lastIndexOf('/') + 1))
				path.endsWith('.yml') &&
					(path = path.substring(0, path.lastIndexOf('.yml')))
				return path
			}

			function onWatchEvent(
				fn: (opts: {
					isFile: boolean
					isFolder: boolean
					name: string
					path: string
					stats?: fs.Stats
				}) => void,
			) {
				async function onEvent(filepath: string) {
					const stats = await fs.stat(filepath)
					return fn({
						isFile: stats.isFile(),
						isFolder: stats.isDirectory(),
						name: getFileName(filepath),
						path: filepath,
					})
				}
				return onEvent
			}

			const watchGlob = path.join(dir, '**/*')
			const watcher = chokidar.watch(watchGlob, {
				followSymlinks: true,
				ignoreInitial: true,
			})

			watcher
				.on('ready', () => {
					u.log(`${tag} Watching for file changes at ${co.magenta(dir)}`)
					sendMessage({ type: 'WATCHING' })
				})
				.on(
					'change',
					onWatchEvent((args) => {
						u.log(`${tag} file changed`, args.path)
						sendMessage({ type: 'FILE_CHANGED', ...args })
					}),
				)
				.on(
					'add',
					onWatchEvent((args) => {
						u.log(`${tag} file added`, args.path)
						sendMessage({ type: 'FILE_ADDED', ...args })
					}),
				)
				.on(
					'addDir',
					onWatchEvent((args) => {
						u.log(`${tag} folder added`, args.path)
						sendMessage({ type: 'FOLDER_ADDED', ...args })
					}),
				)
				.on(
					'unlink',
					onWatchEvent((args) => {
						u.log(`${tag} file was removed`, args.path)
						sendMessage({ type: 'FILE_REMOVED', ...args })
					}),
				)
				.on(
					'unlinkDir',
					onWatchEvent((args) => {
						u.log(`${tag} folder was removed`, args.path)
						sendMessage({ type: 'FOLDER_REMOVED', ...args })
					}),
				)
				.on('error', (err) => {
					u.log(`${tag} error`, err)
					sendMessage({ type: 'WATCH_ERROR', error: err })
				})
		})
	}
})()

export default configureServer
