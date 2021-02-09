import express from 'express'
import path from 'path'
import fs from 'fs-extra'
import {
	gql,
	ApolloServer,
	ApolloServerExpressConfig,
} from 'apollo-server-express'
import { ApolloServerPlugin } from 'apollo-server-plugin-base'
import { loadFilesSync } from '@graphql-tools/load-files'
import emitResolvers from './resolvers/emit.resolvers'
import * as u from '../utils/common'

interface MetadataObject {
	assetType: 'html' | 'image' | 'js' | 'pdf' | 'video' | 'yml'
	ext?: string
	filepath?: any
	route: string
}

const log = console.log
const MISSING_SERVER_DIR = 'missing.server.dir'

interface Options {
	serverDir?: string
	docsDir?: string
	host?: string
	port?: number
	protocol?: string
}

const configureServer = (function () {
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
		createMetadataReducer(
			pred: (filestats: fs.Stats, filepath: string) => boolean,
		) {
			return (serverDir: string) => {
				return function metadataReducer(
					acc: MetadataObject[],
					filename: string,
				) {
					const filepath = path.join(serverDir, filename)
					const stat = fs.statSync(filepath)
					if (pred(stat, filepath))
						return acc.concat(o.getFilepathMetadata(filepath))
					return acc
				}
			}
		},
		getFilepathMetadata(filepath: string): MetadataObject {
			let hasSlash = filepath.includes('/')
			let route = ''

			if (hasSlash) {
				route = filepath.substring(filepath.lastIndexOf('/'))
				if (route.includes('.'))
					route = route.substring(0, route.lastIndexOf('.'))
			} else {
				route = filepath
			}

			const result = {
				route,
			} as MetadataObject

			if (u.isYml(filepath)) {
				result.assetType = 'yml'
				result.ext = 'yml'
			} else if (u.isImg(filepath)) {
				result.assetType = 'image'
				result.ext = filepath
					.substring(filepath.lastIndexOf('.'))
					.replace('.', '')
			} else if (u.isPdf(filepath)) {
				result.assetType = 'pdf'
				result.ext = 'pdf'
			} else if (u.isVid(filepath)) {
				result.assetType = 'video'
				result.ext = filepath
					.substring(filepath.lastIndexOf('.'))
					.replace('.', '')
			} else if (u.isHtml(filepath)) {
				result.assetType = 'html'
				result.ext = 'html'
			} else if (u.isJs(filepath)) {
				result.assetType = 'js'
				result.ext = 'js'
			}

			if (result.assetType) result.filepath = filepath

			return result
		},
		loadFile(filepath: string) {
			return fs.readFileSync(filepath, 'utf8')
		},
	}

	const createImageReducer = o.createMetadataReducer(
		(stat, filepath) => stat.isFile() && u.isImg(filepath),
	)

	const createYmlReducer = o.createMetadataReducer(
		(stat, filepath) => stat.isFile() && u.isYml(filepath),
	)

	return async function createServer({
		serverDir = MISSING_SERVER_DIR,
		host = 'localhost',
		port = 4000,
		protocol = 'http',
	}: Options) {
		if (serverDir === MISSING_SERVER_DIR) {
			throw new Error(`Please provide a directory for the server`)
		}

		const serverUrl = `${protocol}://${host}:${port}`
		const assetsDir = path.join(serverDir, 'assets')
		const typeDefs = loadFilesSync('src/server/graphql/**/*', {
			extensions: ['.graphql'],
		})
		const imgReducer = createImageReducer(assetsDir)
		const ymlReducer = createYmlReducer(serverDir)

		await Promise.all([fs.ensureDir(serverDir), fs.ensureDir(assetsDir)])

		const ymlMetadataObjects = fs
			.readdirSync(serverDir, 'utf8')
			.reduce(ymlReducer, [] as MetadataObject[])

		const assetsMetadataObjects = fs
			.readdirSync(assetsDir)
			.reduce(imgReducer, [] as MetadataObject[])

		log(`\nLoaded ${u.magenta(typeDefs.length)} type definitions`)
		log(`Found ${u.magenta(ymlMetadataObjects.length)} yaml files`)
		log(`Found ${u.magenta(assetsMetadataObjects.length)} asset files`)

		const options: ApolloServerExpressConfig = {
			typeDefs: gql`
				type Query {
					goto(page: String!): String
				}

				type Mutation {
					sendEmit(value: String): String
				}

				input SendEmitInput {
					trigger: String!
					keys: [String]
				}

				input DataKeyObject {
					keys: [String]
				}
			`,
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
					route: req.route,
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

		ymlMetadataObjects.forEach(({ assetType, filepath, route }) => {
			log(u.yellow(`Registering ${u.magenta(assetType)} route: ${route}`))
			const routes = [route, `${route}.yml`, `${route}_en.yml`]
			app.get(routes, (req, res) => res.send(o.loadFile(filepath)))
		})

		assetsMetadataObjects.forEach(({ assetType, ext, filepath, route }) => {
			if (route.startsWith('/')) route = route.replace('/', '')
			route = `/assets/${route}.${ext}`
			log(u.yellow(`Registering ${u.magenta(assetType)} route: ${route}`))
			const routes = [route, `${route}_en.yml`, `${route}.yml`]
			app.get(routes, (req, res) => {
				res.sendFile(path.resolve(path.join(process.cwd(), filepath)))
			})
		})

		graphqlServer.applyMiddleware({ app })

		app.listen({ cors: { origin: '*', credentials: true }, port }, () => {
			log(
				`\n🚀 Server ready at ${u.cyan(
					`${serverUrl}${graphqlServer.graphqlPath}`,
				)}`,
			)
		})
	}
})()

export default configureServer
