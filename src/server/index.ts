import * as u from '@jsmanifest/utils'
import express from 'express'
import chokidar from 'chokidar'
import fs from 'fs-extra'
import WebSocket from 'ws'
import { ApolloServer, ApolloServerExpressConfig } from 'apollo-server-express'
import { ApolloServerPlugin } from 'apollo-server-plugin-base'
import globby from 'globby'
import createAggregator from '../api/createAggregator'
import emitResolvers from './resolvers/emit.resolvers'
import typeDefs from '../generated/typeDefs'
import { GetServerFiles } from '../panels/GetServerFiles/types'
import * as co from '../utils/color'
import * as com from '../utils/common'

const log = console.log

interface Options {
	config: string
	serverDir: string
	docsDir?: string
	host?: string
	port?: number
	protocol?: string
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
						`${u.magenta(String(failed.length))} files failed\n`,
				)
			}
		},
		loadFile(filepath: string) {
			return fs.readFileSync(filepath, 'utf8')
		},
	}

	return async function createServer({
		config = '',
		serverDir = '',
		host = 'localhost',
		port = 3001,
		protocol = 'http',
	}: Options) {
		if (!config) throw new Error('A config (name) must be set')
		if (!serverDir) throw new Error(`Please provide a directory for the server`)

		const aggregator = createAggregator()
		aggregator.config = config
		const serverUrl = `${protocol}://${host}:${port}`

		const localFiles = globby.sync(serverDir)

		const metadata = localFiles.reduce(
			(acc, filepath) => {
				const stat = fs.statSync(filepath)
				if (stat.isFile()) {
					if (filepath.includes('/assets')) {
						acc.assets.push(com.getFilepathMetadata(filepath))
					} else {
						acc.yml.push(com.getFilepathMetadata(filepath))
					}
				}
				return acc
			},
			{
				assets: [] as GetServerFiles.MetadataObject[],
				yml: [] as GetServerFiles.MetadataObject[],
			},
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
			(req, res) =>
				res.sendFile(com.getFilePath(serverDir, 'cadlEndpoint.yml')),
		)

		metadata.yml.forEach(({ group, filepath, filename }) => {
			!filename.startsWith('/') && (filename = `/${filename}`)
			filename.endsWith('.yml') && (filename = filename.replace('.yml', ''))
			group = 'page' as any
			log(
				u.white(
					`Registering ${u.yellow(group)} pathname: ${u.magenta(
						filename,
					)} filepath: ${filepath}`,
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
				u.white(
					`Registering ${u.yellow(group)} pathname: ${u.magenta(
						filename,
					)} filepath: ${filepath}`,
				),
			)
			const routes = [filename, `/assets/${filename.replace('/', '')}`]
			app.get(routes, (req, res) => {
				res.sendFile(filepath)
			})
		})

		graphqlServer.applyMiddleware({ app })

		app.listen({ cors: { origin: '*' }, port }, () => {
			let graphqlPath = graphqlServer.graphqlPath
			if (!graphqlPath.startsWith('/')) graphqlPath = `/${graphqlPath}`

			const comet = '\u2604\uFE0F'
			const croissant = '\uD83D\uDE48'
			const host = `127.0.0.1`
			const port = 3002
			const wss = new WebSocket.Server({ host, port })
			const tags = {
				ws: co.aquamarine('ws'),
				host: co.lightGreen(host),
				port: u.green(String(port)),
				slash: u.cyan('//'),
				graphql: co.aquamarine('graphql'),
				config: u.yellow(config),
			}

			log(
				`\n${comet}   Server ready at ${u.cyan(`${serverUrl}`)}/${
					tags.graphql
				} ${config ? `using config ${tags.config}` : ''}`,
			)

			wss.on('listening', () => {
				log(
					`${croissant}  WebSocket server is listening at: ${tags.ws}:${tags.slash}` +
						`${tags.host}:${tags.port}`,
				)
			})

			wss.on('connection', (ws, { socket }) => {
				u.newline()
				log(co.brightGreen(`Client is connected`), {
					ip: socket.remoteAddress,
				})
				ws.on('message', (message) => log('Received: %s', message))
			})

			wss.on('close', () => log(u.white(`WebSocket server has closed`)))
			wss.on('error', (err) => log(u.red(`[${err.name}] ${err.message}`)))

			app._router.stack.forEach(function ({ route }: any) {
				if (route) {
					const { methods, path, stack } = route
					// console.log(path)
				}
			})

			const watcher = chokidar.watch(com.getFilePath('server/**/*'), {
				cwd: process.cwd(),
				followSymlinks: true,
				ignoreInitial: true,
			})

			const tag = `[${co.cyan(`watcher`)}]`

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
				async function onEvent(path: string) {
					const stats = await fs.stat(com.getFilePath(path))
					return fn({
						isFile: stats.isFile(),
						isFolder: stats.isDirectory(),
						name: getFileName(path),
						path,
						stats,
					})
				}
				return onEvent
			}

			watcher
				.on('ready', () => {
					u.log(
						`${tag} Watching for file changes at ${u.magenta(
							com.getFilePath(serverDir),
						)}`,
					)
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
