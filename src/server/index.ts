import express from 'express'
import path from 'path'
import fs from 'fs-extra'
import { ApolloServer, ApolloServerExpressConfig } from 'apollo-server-express'
import { ApolloServerPlugin } from 'apollo-server-plugin-base'
import globby from 'globby'
import createAggregator from '../api/createAggregator'
import emitResolvers from './resolvers/emit.resolvers'
import typeDefs from '../generated/typeDefs'
import { MetadataObject } from '../panels/ServerFiles/types'
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
		console.log('arguments', arguments)
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
						acc.assets.push(u.getFilepathMetadata(filepath))
					} else {
						acc.yml.push(u.getFilepathMetadata(filepath))
					}
				}
				return acc
			},
			{ assets: [] as MetadataObject[], yml: [] as MetadataObject[] },
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
			(req, res) => res.sendFile(u.getFilepath(serverDir, 'cadlEndpoint.yml')),
		)

		metadata.yml.forEach(({ group, filepath, filename }) => {
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
			if (filename.startsWith('/')) filename = filename.replace('/', '')
			log(
				u.white(
					`Registering ${u.yellow(group)} pathname: ${u.magenta(
						filename,
					)} filepath: ${filepath}`,
				),
			)
			const routes = [filename, `assets/${filename}`]
			app.get(routes, (req, res) => {
				res.sendFile(filepath)
			})
		})

		graphqlServer.applyMiddleware({ app })

		app.listen({ cors: { origin: '*' }, port }, () => {
			log(
				`\n🚀 Server ready at ${u.cyan(
					`${serverUrl}${graphqlServer.graphqlPath}`,
				)} ${config ? `using config ${u.magenta(config)}` : ''}`,
			)
			app._router.stack.forEach(function ({ route }: any) {
				if (route) {
					const { methods, path, stack } = route
					// console.log(path)
				}
			})
		})
	}
})()

export default configureServer
