import express from 'express'
import path from 'path'
import fs from 'fs-extra'
import { ApolloServer, ApolloServerExpressConfig } from 'apollo-server-express'
import { ApolloServerPlugin } from 'apollo-server-plugin-base'
import createAggregator from '../api/createAggregator'
import emitResolvers from './resolvers/emit.resolvers'
import typeDefs from '../generated/typeDefs'
import loadNoodlAppDir from '../scripts/loadNoodlAppFiles'
import * as u from '../utils/common'

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
			const [copied, failed] = await u.promiseAllSafelySplit(
				...filepaths.map((filepath) =>
					Promise.resolve(fs.copyFile(filepath, to)),
				),
			)
			if (failed.length) {
				log(
					`\n${copied.length} files were copied over but ` +
						`${u.magenta(failed.length)} files failed\n`,
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

		const aggregator = createAggregator({ config })
		const serverUrl = `${protocol}://${host}:${port}`

		const { rootConfig, appConfig, metadata } = await loadNoodlAppDir({
			aggregator,
			config,
			serverDir,
		})

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
				res.send(o.loadFile(path.join(serverDir, 'cadlEndpoint.yml'))),
		)

		metadata.yml.forEach(({ assetType, filepath, pathname }) => {
			log(u.yellow(`Registering ${u.magenta(assetType)} pathname: ${pathname}`))
			const routes = [pathname, `${pathname}.yml`, `${pathname}_en.yml`]
			app.get(routes, (req, res) => res.send(o.loadFile(filepath)))
		})

		metadata.assets.forEach(({ assetType, ext, filepath, pathname }) => {
			if (pathname.startsWith('/')) pathname = pathname.replace('/', '')
			pathname = `/assets/${pathname}.${ext}`
			log(u.yellow(`Registering ${u.magenta(assetType)} pathname: ${pathname}`))
			const routes = [pathname, `${pathname}_en.yml`, `${pathname}.yml`]
			app.get(routes, (req, res) => {
				res.sendFile(path.resolve(path.join(process.cwd(), filepath)))
			})
		})

		graphqlServer.applyMiddleware({ app })

		app.listen({ cors: { origin: '*', credentials: true }, port }, () => {
			log(
				`\n🚀 Server ready at ${u.cyan(
					`${serverUrl}${graphqlServer.graphqlPath}`,
				)} ${config ? `using config ${u.magenta(config)}` : ''}`,
			)
		})
	}
})()

export default configureServer
