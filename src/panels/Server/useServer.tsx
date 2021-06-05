import * as u from '@jsmanifest/utils'
import React from 'react'
import yaml from 'yaml'
import express from 'express'
import chokidar from 'chokidar'
import path from 'path'
import fs from 'fs-extra'
import WebSocket from 'ws'
import globby from 'globby'
import useCtx from '../../useCtx'
import { MetadataFileObject } from '../../types'
import * as co from '../../utils/color'
import * as com from '../../utils/common'

const log = console.log

interface Options {
	host?: string
	local?: boolean
	port?: number
	watch?: boolean
	wss?: boolean
}

function useServer({
	host = 'localhost',
	local = false,
	port = 3001,
	watch: enableWatch = true,
	wss: enableWss = false,
}: Options) {
	const wss = React.useRef<WebSocket.Server | null>(null)
	const watcher = React.useRef<chokidar.FSWatcher | null>(null)

	const { aggregator, configuration } = useCtx()

	const getDir = React.useCallback(
		() => path.join(configuration.getPathToGenerateDir(), aggregator.configKey),
		[aggregator.configKey],
	)

	const getServerUrl = React.useCallback(() => `http://${host}:${port}`, [])

	const getLocalFilesAsMetadata = React.useCallback((): {
		assets: MetadataFileObject[]
		yml: MetadataFileObject[]
	} => {
		function reducer(
			acc: { assets: MetadataFileObject[]; yml: MetadataFileObject[] },
			filepath: string,
		) {
			const stat = fs.statSync(filepath)
			if (stat.isFile()) {
				if (filepath.includes('/assets')) {
					acc.assets.push(
						com.createFileMetadataExtractor(filepath, {
							config: aggregator.configKey,
						}),
					)
				} else {
					acc.yml.push(
						com.createFileMetadataExtractor(filepath, {
							config: aggregator.configKey,
						}),
					)
				}
			}
			return acc
		}
		const localFiles = globby.sync(getDir())
		const metadata = u.reduce(localFiles, reducer, { assets: [], yml: [] })
		return metadata
	}, [])

	const listen = React.useCallback(() => {
		const metadata = getLocalFilesAsMetadata()
		const app = express()

		app.get(
			['/HomePageUrl', '/HomePageUrl_en.yml', '/HomePageUrl.yml'],
			(req, res) => res.send(''),
		)

		app.get(
			['/cadlEndpoint', '/cadlEndpoint.yml', '/cadlEndpoint_en.yml'],
			(req, res) => res.sendFile(path.join(getDir(), 'cadlEndpoint.yml')),
		)

		for (let { group, filepath, filename } of metadata.yml) {
			filename = com.ensureSlashPrefix(filename)
			filename.endsWith('.yml') && (filename = filename.replace('.yml', ''))
			// Config (ex: meet4d.yml)
			if (filename.includes(aggregator.configKey)) {
				group = 'config'
				if (local) {
					app.get(
						[filename, `${filename}.yml`, `${filename}_en.yml`],
						(req, res) => {
							const yml = fs.readFileSync(path.resolve(filepath), 'utf8')
							const doc = yaml.parseDocument(yml)
							doc.set('cadlBaseUrl', `http://${host}:${port}/`)
							doc.has('myBaseUrl') &&
								doc.set('myBaseUrl', `http://${host}:${port}/`)
							res.send(doc.toString())
						},
					)
				} else {
					app.get(
						[filename, `${filename}.yml`, `${filename}_en.yml`],
						(req, res) =>
							res.sendFile(fs.readFileSync(path.resolve(filepath), 'utf8')),
					)
				}
			}
			// Pages (ex: SignIn.yml)
			else {
				group = 'page' as any
				app.get(
					[filename, `${filename}.yml`, `${filename}_en.yml`],
					(req, res) =>
						res.sendFile(fs.readFileSync(path.resolve(filepath), 'utf8')),
				)
			}
			const msg = `Registered route: ${co.yellow(filename)} [${co.magenta(
				group,
			)}]`
			log(co.white(msg))
		}

		for (let { group, filepath, filename } of metadata.assets) {
			filename = com.ensureSlashPrefix(filename)
			const msg = `Registering route: ${co.yellow(filename)} [${co.magenta(
				group,
			)}]`
			log(co.white(msg))
			app.get([filename, `/assets/${filename.replace('/', '')}`], (req, res) =>
				res.sendFile(path.resolve(filepath)),
			)
		}

		app.listen({ cors: { origin: '*' }, port }, () => {
			log(
				`\n🚀 Server ready at ${co.cyan(`${getServerUrl()}`)} ${
					aggregator.configKey
						? `using config ${co.yellow(aggregator.configKey)}`
						: ''
				}`,
			)

			if (enableWss) {
				const wssPort = 3002
				wss.current = new WebSocket.Server({ host, port: wssPort })

				wss.current.on('listening', () => {
					log(`🚀 Wss is listening at: ${co.cyan(`ws://${host}:${wssPort}`)}`)
				})

				wss.current.on('connection', function connection(ws, sender) {
					const { socket } = sender
					const ip = socket.remoteAddress

					u.newline()
					ws.on('message', (message) => log('Received: %s', message))
					// ws.send('Hello client. I am your WSS')
				})

				wss.current.on('close', () =>
					log(co.white(`WebSocket server has closed`)),
				)
				wss.current.on('error', (err) =>
					log(co.red(`[${err.name}] ${err.message}`)),
				)
			}

			const tag = `[${co.cyan(`watcher`)}]`

			function sendMessage(msg: Record<string, any>) {
				return new Promise((resolve, reject) => {
					wss.current?.clients.forEach((client) => {
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
					filepath = path.resolve(filepath)
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

			if (enableWatch) {
				const watchGlob = path.join(getDir(), '**/*')
				watcher.current = chokidar.watch(watchGlob, {
					followSymlinks: true,
					ignoreInitial: true,
				})

				watcher.current
					.on('ready', () => {
						u.log(`${tag} Watching for file changes at ${co.magenta(getDir())}`)
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
			}
		})
	}, [])

	return {
		dir: getDir(),
		listen,
		url: getServerUrl(),
	}
}

export default useServer
