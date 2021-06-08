import * as u from '@jsmanifest/utils'
import * as com from 'noodl-common'
import { MetadataFileObject } from 'noodl-common'
import React from 'react'
import yaml from 'yaml'
import express from 'express'
import path from 'path'
import fs from 'fs-extra'
import globby from 'globby'
import useCtx from '../../useCtx'
import useWss from '../../hooks/useWss'
import useWatcher from '../../hooks/useWatcher'
import * as co from '../../utils/color'

const log = console.log

interface Options {
	host?: string
	local?: boolean
	port?: number
	watch?: boolean
	wss?: boolean
	wssPort?: number
}

function useServer({
	host = 'localhost',
	local = false,
	port = 3001,
	watch: enableWatch = true,
	wss: enableWss = false,
	wssPort,
}: Options) {
	const server = React.useRef<express.Express | null>(null)
	const { aggregator, configuration } = useCtx()

	const getServerUrl = React.useCallback(() => `http://${host}:${port}`, [])
	const getDir = (...s: string[]) =>
		path.join(configuration.getPathToGenerateDir(), aggregator.configKey, ...s)

	/* -------------------------------------------------------
		---- WebSocket
	-------------------------------------------------------- */
	const {
		wss,
		connect: connectToWss,
		sendMessage,
	} = useWss({
		host,
		onConnection(socket) {
			u.newline()
			socket.on('message', (message) => log('Received: %s', message))
		},
		onClose() {
			log(co.white(`WebSocket server has closed`))
		},
		onError(err) {
			log(co.red(`[${err.name}] ${err.message}`))
		},
		onListening() {
			log(`🚀 Wss is listening at: ${co.cyan(`ws://${host}:${wssPort}`)}`)
		},
	})

	/* -------------------------------------------------------
		---- Watcher
	-------------------------------------------------------- */
	const {
		tag: watchTag,
		watch,
		watcher,
	} = useWatcher({
		watchGlob: path.join(getDir(), '**/*'),
		watchOptions: { followSymlinks: true },
		onReady() {
			u.log(`${watchTag} Watching for file changes at ${co.magenta(getDir())}`)
			sendMessage({ type: 'WATCHING' })
		},
		onAdd(args) {
			u.log(`${watchTag} file added`, args.path)
			const metadata = com.createFileMetadataExtractor(
				path.isAbsolute(args.path) ? args.path : com.getAbsFilePath(args.path),
				{ config: aggregator.configKey },
			)
			if (args.path.includes('/assets')) {
				registerRoutes({ assets: [metadata] })
			} else if (args.path.endsWith('yml')) {
				registerRoutes({ yml: [metadata] })
			}
			sendMessage({ type: 'FILE_ADDED', ...args })
		},
		onAddDir(args) {
			u.log(`${watchTag} folder added`, args.path)
			sendMessage({ type: 'FOLDER_ADDED', ...args })
		},
		onChange(args) {
			u.log(`${watchTag} file changed`, args.path)
			sendMessage({ type: 'FILE_CHANGED', ...args })
		},
		onError(err) {
			u.log(`${watchTag} error`, err)
			sendMessage({ type: 'WATCH_ERROR', error: err })
		},
		onUnlink(filepath) {
			u.log(`${watchTag} file was removed`, filepath)
			sendMessage({ type: 'FILE_REMOVED', filepath })
		},
		onUnlinkDir(filepath) {
			u.log(`${watchTag} folder was removed`, filepath)
			sendMessage({ type: 'FOLDER_REMOVED', filepath })
		},
	})

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

	/* -------------------------------------------------------
		---- Connect to server
	-------------------------------------------------------- */
	const connect = React.useCallback(() => {
		server.current = express()
		server.current.get(
			['/HomePageUrl', '/HomePageUrl_en.yml', '/HomePageUrl.yml'],
			(req, res) => res.send(''),
		)
		server.current.get(
			['/cadlEndpoint', '/cadlEndpoint.yml', '/cadlEndpoint_en.yml'],
			(req, res) => res.sendFile(getDir('cadlEndpoint.yml')),
		)
	}, [getDir])

	/* -------------------------------------------------------
		---- Start listening on the server
	-------------------------------------------------------- */
	const listen = React.useCallback(() => {
		const metadata = getLocalFilesAsMetadata()
		connect()
		registerRoutes(metadata)
		/* -------------------------------------------------------
			---- START SERVER
		-------------------------------------------------------- */
		server.current?.listen({ cors: { origin: '*' }, port }, () => {
			const msg = `\n🚀 Server ready at ${co.cyan(getServerUrl())} ${
				aggregator.configKey
					? `using config ${co.yellow(aggregator.configKey)}`
					: ''
			}`
			log(msg)
			enableWss && connectToWss()
			enableWatch && watch()
		})
	}, [])
	/* -------------------------------------------------------
		---- CREATING THE ROUTES
	-------------------------------------------------------- */
	const registerRoutes = React.useCallback(
		(metadata: Partial<ReturnType<typeof getLocalFilesAsMetadata>>) => {
			/* -------------------------------------------------------
				---- YML (Pages and other root level objects)
			-------------------------------------------------------- */
			if (metadata.yml) {
				for (let { group, filepath, filename } of metadata.yml) {
					filename = com.ensureSlashPrefix(filename)
					filename.endsWith('.yml') && (filename = filename.replace('.yml', ''))
					// Config (ex: meet4d.yml)
					if (filename.includes(aggregator.configKey)) {
						group = 'config'
						if (local) {
							server.current?.get(
								[filename, `${filename}.yml`, `${filename}_en.yml`],
								(req, res) => {
									const yml = fs.readFileSync(filepath, 'utf8')
									const doc = yaml.parseDocument(yml)
									doc.set('cadlBaseUrl', `http://${host}:${port}/`)
									doc.has('myBaseUrl') &&
										doc.set('myBaseUrl', `http://${host}:${port}/`)
									res.send(doc.toString())
								},
							)
						} else {
							server.current?.get(
								[filename, `${filename}.yml`, `${filename}_en.yml`],
								(req, res) => {
									res.sendFile(filepath)
								},
							)
						}
					}
					// Pages (ex: SignIn.yml)
					else {
						group = 'page' as any
						server.current?.get(
							[filename, `${filename}.yml`, `${filename}_en.yml`],
							(req, res) => {
								res.sendFile(filepath)
							},
						)
					}
					const msg = `Registered route: ${co.yellow(filename)} [${co.magenta(
						group,
					)}]`
					log(co.white(msg))
				}
			}
			/* -------------------------------------------------------
				---- ASSETS 
			-------------------------------------------------------- */
			if (metadata.assets) {
				for (let { group, filepath, filename } of metadata.assets) {
					filename = com.ensureSlashPrefix(filename)
					const msg = `Registering route: ${co.yellow(filename)} [${co.magenta(
						group,
					)}]`
					log(co.white(msg))
					server.current?.get(
						[filename, `/assets/${filename.replace('/', '')}`],
						(req, res) => res.sendFile(filepath),
					)
				}
			}
		},
		[aggregator.configKey],
	)

	return {
		dir: getDir(),
		listen,
		registerRoutes,
		url: getServerUrl(),
	}
}

export default useServer
