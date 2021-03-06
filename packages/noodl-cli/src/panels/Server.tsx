import * as u from '@jsmanifest/utils'
import type { FileStructure } from 'noodl'
import { getAbsFilePath, getFileStructure } from 'noodl'
import React from 'react'
import { Box, Newline, Text } from 'ink'
import fg from 'fast-glob'
import yaml from 'yaml'
import express from 'express'
import path from 'path'
import fs from 'fs-extra'
import { ensureSlashPrefix } from '../utils/common.js'
import TextInput from '../components/TextInput.js'
import useCtx from '../useCtx.js'
import useConfigInput from '../hooks/useConfigInput.js'
import useWatcher from '../hooks/useWatcher.js'
import useWss from '../hooks/useWss.js'
import * as c from '../constants.js'
import * as co from '../utils/color.js'

export interface Props {
	config: string
	isConfigFromServerFlag: boolean
	host?: string
	isRemote?: boolean
	port?: number
	wss?: {
		port?: number
	}
	watch?: boolean
}

function Server({
	config: initialConfigValue,
	host = c.DEFAULT_SERVER_HOSTNAME,
	isRemote,
	port = c.DEFAULT_SERVER_PORT,
	watch: enableWatch,
	wss: wssProp,
}: Props) {
	const ref = React.useRef<express.Express | null>(null)
	const { aggregator, configuration, log, logError, toggleSpinner } = useCtx()

	const getDir = React.useCallback(
		(...s: string[]) =>
			path.join(
				configuration.getPathToGenerateDir(),
				aggregator.configKey || initialConfigValue || '',
				...s,
			),
		[aggregator.configKey],
	)
	const getServerUrl = React.useCallback(() => `http://${host}:${port}`, [])
	const getWatchGlob = React.useCallback(() => path.join(getDir(), '**/*'), [])

	/* -------------------------------------------------------
		---- Config Input
	-------------------------------------------------------- */
	const {
		config,
		inputValue: configInput,
		setInputValue: setConfigInputValue,
		isNotFound,
		lastTried: lastConfigSubmitted,
		validate,
		validating,
	} = useConfigInput({
		fallbackDir: getDir(),
		initialValue: initialConfigValue,
		onValidated(configKey, dir) {
			if (aggregator.configKey !== configKey) {
				aggregator.configKey = configKey
				aggregator.init({ dir }).finally(() => listen())
			} else {
				listen()
			}
		},
		onValidateStart(configValue) {
			toggleSpinner()
		},
		onValidateEnd() {
			toggleSpinner(false)
		},
		onNotFound() {},
		onError: (err) => logError,
	})

	/* -------------------------------------------------------
		---- WebSocket
	-------------------------------------------------------- */

	const {
		wss,
		connect: connectToWss,
		sendMessage,
	} = useWss({
		host,
		port: wssProp?.port,
	})

	/* -------------------------------------------------------
		---- Watcher
	-------------------------------------------------------- */

	const {
		tag: watchTag,
		watch,
		watcher,
		watching,
	} = useWatcher({
		watchOptions: { followSymlinks: true },
	})

	const getLocalFilesAsMetadata = React.useCallback((): {
		assets: FileStructure[]
		yml: FileStructure[]
	} => {
		function reducer(
			acc: { assets: FileStructure[]; yml: FileStructure[] },
			filepath: string,
		) {
			const stat = fs.statSync(filepath)
			if (stat.isFile()) {
				if (filepath.includes('/assets')) {
					acc.assets.push(
						getFileStructure(filepath, { config: aggregator.configKey }),
					)
				} else {
					acc.yml.push(
						getFileStructure(filepath, { config: aggregator.configKey }),
					)
				}
			}
			return acc
		}
		const localFiles = fg.sync(getWatchGlob().replace(/\\/g, '/'))
		log(
			`Picked up ${u.yellow(
				String(localFiles.length),
			)} local files to register routes with\n`,
		)
		const metadata = u.reduce(localFiles, reducer, { assets: [], yml: [] })
		return metadata
	}, [])

	/* -------------------------------------------------------
		---- Connect to server
	-------------------------------------------------------- */

	const connect = React.useCallback(() => {
		ref.current = express()
		ref.current.get(
			['/HomePageUrl', '/HomePageUrl_en.yml', '/HomePageUrl.yml'],
			(req, res) => res.send(''),
		)
		ref.current.get(
			['/cadlEndpoint', '/cadlEndpoint.yml', '/cadlEndpoint_en.yml'],
			(req, res) => res.sendFile(getDir('cadlEndpoint.yml')),
		)
	}, [])

	/* -------------------------------------------------------
		---- Start listening on the server
	-------------------------------------------------------- */

	const listen = React.useCallback(() => {
		const metadata = getLocalFilesAsMetadata()
		connect()
		registerRoutes(metadata)

		/* -------------------------------------------------------
			---- Start server
		-------------------------------------------------------- */

		ref.current?.listen({ cors: { origin: '*' }, port }, () => {
			log(
				`\n???? Server ready at ${co.cyan(getServerUrl())} ${
					aggregator.configKey
						? `using config ${co.yellow(aggregator.configKey)}`
						: ''
				}`,
			)

			if (wssProp) {
				connectToWss({
					onConnection(socket) {
						u.newline()
						socket.on('message', (message) => log(`Received: ${message}`))
					},
					onClose() {
						log(co.white(`WebSocket server has closed`))
					},
					onError: logError,
					onListening() {
						log(
							`???? Wss is listening at: ${co.cyan(
								`ws://${host}:${wssProp.port || c.DEFAULT_WSS_PORT}`,
							)}`,
						)
					},
				})
			}

			if (enableWatch) {
				watch({
					watchGlob: getWatchGlob(),
					onReady(watchedFiles, watchCount) {
						log(
							`\n${watchTag} Watching ${co.yellow(
								watchCount,
							)} files for changes at ${co.magenta(getDir())}\n`,
						)
						sendMessage({ type: 'WATCHING' })
					},
					onAdd(args) {
						u.log(`${watchTag} file added`, args.path)
						const metadata = getFileStructure(
							path.isAbsolute(args.path)
								? args.path
								: getAbsFilePath(args.path),
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
						logError(err)
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
			}
		})
	}, [])

	/* -------------------------------------------------------
		---- Creating the routes
	-------------------------------------------------------- */

	const registerRoutes = React.useCallback(
		(metadata: Partial<ReturnType<typeof getLocalFilesAsMetadata>>) => {
			/* -------------------------------------------------------
				---- YML (Pages and other root level objects)
			-------------------------------------------------------- */

			if (metadata.yml) {
				for (let { group, filepath, filename } of metadata.yml) {
					filename = ensureSlashPrefix(filename)
					filename.endsWith('.yml') && (filename = filename.replace('.yml', ''))
					// Config (ex: meet4d.yml)
					if (filename.includes(aggregator.configKey)) {
						group = 'config'
						if (!isRemote) {
							ref.current?.get(
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
							ref.current?.get(
								[filename, `${filename}.yml`, `${filename}_en.yml`],
								(req, res) => res.sendFile(filepath),
							)
						}
					}
					// Pages (ex: SignIn.yml)
					else {
						group = 'page' as any
						ref.current?.get(
							[filename, `${filename}.yml`, `${filename}_en.yml`],
							(req, res) => res.sendFile(filepath),
						)
					}
					log(
						co.white(
							`Registered route: ${co.yellow(filename)} [${co.magenta(group)}]`,
						),
					)
				}
			}

			/* -------------------------------------------------------
				---- ASSETS
			-------------------------------------------------------- */

			if (metadata.assets) {
				for (let { filepath, filename, ext = '' } of metadata.assets) {
					let middlePaths = ''
					filename = ensureSlashPrefix(filename)
					if (filepath.includes('assets/')) {
						middlePaths = filepath.substring(
							filepath.indexOf('assets/') + 'assets/'.length,
						)
						middlePaths = middlePaths.substring(
							0,
							middlePaths.indexOf(filename),
						)
						if (middlePaths && !middlePaths.endsWith('.')) {
							middlePaths += '/'
						}
					}
					const assetPath = `/assets/${middlePaths}${filename.replace(
						'/',
						'',
					)}${ext}`
					ref.current?.get([assetPath], (req, res) => res.sendFile(filepath))
				}
			}
		},
		[aggregator.configKey],
	)

	if (!config) {
		return (
			<Box padding={1} flexDirection="column">
				{validating ? (
					<Text color="white">
						Validating{' '}
						<Text color="yellow">{configInput || initialConfigValue}</Text>
						<Text>...</Text>
					</Text>
				) : (
					<>
						<Text>
							What config should we use? (example:{' '}
							<Text color="yellow">meet4d</Text>)
						</Text>
						<Newline />
						<TextInput
							value={configInput}
							onChange={setConfigInputValue}
							onSubmit={validate}
							placeholder={`Enter config`}
						/>
						<Newline />
						{isNotFound ? (
							<Text color="red">
								The config "<Text color="yellow">{lastConfigSubmitted}</Text>"
								does not exist
							</Text>
						) : null}
					</>
				)}
			</Box>
		)
	}

	return null
}

export default Server
