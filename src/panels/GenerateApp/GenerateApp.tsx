import { LiteralUnion } from 'type-fest'
import { DeviceType, Env } from 'noodl-types'
import { Box, Static, Text } from 'ink'
import { UncontrolledTextInput } from 'ink-text-input'
import * as u from '@jsmanifest/utils'
import React from 'react'
import yaml from 'yaml'
import download from 'download'
import fs from 'fs-extra'
import path from 'path'
import globby from 'globby'
import merge from 'lodash/merge'
import produce, { Draft } from 'immer'
import Panel from '../../components/Panel'
import useConfigInput from '../../hooks/useConfigInput'
import useCtx from '../../useCtx'
import {
	ON_RETRIEVED_ROOT_CONFIG,
	ON_RETRIEVE_APP_PAGE_FAILED,
	PARSED_APP_CONFIG,
	ON_RETRIEVED_APP_PAGE,
} from '../../api/createAggregator'
import { MetadataLinkObject } from '../../types'
import * as com from '../../utils/common'
import * as co from '../../utils/color'
import * as r from '../../utils/remote'
import * as t from './types'

export interface Props {
	config?: string
	configVersion?: string
	deviceType?: LiteralUnion<DeviceType | '', string>
	env?: LiteralUnion<Env, string>
	isLocal?: boolean
	host?: string
	port?: number
	onEnd?(): void
}

export const initialState = {
	configKey: '',
	assets: [] as Array<
		{
			status: 'downloading' | 'downloaded' | 'does-not-exist'
		} & MetadataLinkObject
	>,
}

function GenerateApp(props: Props) {
	const { aggregator, configuration, log, logError, spinner, toggleSpinner } =
		useCtx()

	const {
		config: configValue,
		lastTried,
		valid,
		validate,
		validating,
	} = useConfigInput({
		initialConfig: props.config,
		onExists: (value) => loadConfig(value),
		onNotFound: (value) => {},
		onValidateStart: () => toggleSpinner(),
		onValidateEnd: () => toggleSpinner(false),
	})

	const [state, _setState] = React.useState(() => {
		const initState = {
			...initialState,
			deviceType: props.deviceType,
		} as t.State
		return initState
	})

	const setState = React.useCallback(
		async (
			fn: ((draft: Draft<typeof initialState>) => void) | Partial<t.State>,
		) => {
			_setState(
				produce((draft) => {
					if (u.isFnc(fn)) fn(draft)
					else merge(draft, fn)
				}),
			)
		},
		[],
	)

	const saveFile = React.useCallback(
		async (
			filename: string,
			data: string | Record<string, any> | undefined,
		) => {
			try {
				const optionsArg = u.isStr(data)
					? 'utf8'
					: u.isObj(data)
					? { spaces: 2 }
					: undefined
				const fnKey = u.isStr(data) ? 'writeFile' : 'writeJson'
				const filepath = path.join(
					path.join(configuration.getPathToGenerateDir(), aggregator.configKey),
					filename,
				)
				fs[fnKey] && (await fs[fnKey](filepath, data, optionsArg as any))
			} catch (error) {
				console.error(error)
			}
		},
		[],
	)

	const loadConfig = React.useCallback(
		async (configKey: string) => {
			if (configKey) {
				try {
					log(`\nLoading config ${co.yellow(`${configKey}`)}`)
					let yml = await r.getConfig(configKey)
					let configFileName = !configKey.endsWith('.yml')
						? `${configKey}.yml`
						: configKey

					saveFile(configFileName, yml)
					log(`Saved ${co.yellow(configFileName)} to folder`)

					aggregator.configKey = configKey
					aggregator.env = props.env as Env
					aggregator.deviceType = props.deviceType as DeviceType
					aggregator.configVersion = props.configVersion as string

					if (
						aggregator.configVersion &&
						aggregator.configVersion !== 'latest'
					) {
						log(
							`Config version set to ${co.yellow(aggregator.configVersion)}${
								props.configVersion === 'latest'
									? ` (using option "${co.yellow('latest')}")`
									: ''
							}`,
						)
					}

					const dir = path.join(
						configuration.getPathToGenerateDir(),
						aggregator.configKey,
					)
					const assetsDir = path.join(dir, 'assets')

					if (!fs.existsSync(dir)) {
						await fs.ensureDir(dir)
						log(`Created output directory: ${co.yellow(dir)}`)
					}

					if (!fs.existsSync(assetsDir)) {
						await fs.ensureDir(assetsDir)
						log(
							`Created assets folder in output directory: ${co.yellow(
								assetsDir,
							)}`,
						)
					}

					let numDocsFetching = 0
					let processedDocs = 0

					let done = async function () {
						done = undefined as any
						const assets = aggregator.extractAssets({ remote: false })
						u.newline()

						log(
							`Detected ${co.yellow(
								assets.length,
							)} total assets used in ${co.yellow(
								aggregator.configKey,
							)} config`,
						)

						log(`Checking for assets that are missing from your local drive...`)

						const localAssetsAsPlainFileNames = [] as string[]
						const localAssetsAsFilePaths = [] as string[]

						for (const filepath of await globby(path.join(assetsDir, '**/*'), {
							onlyFiles: true,
						})) {
							localAssetsAsPlainFileNames.push(com.getFilename(filepath))
							localAssetsAsFilePaths.push(filepath)
						}

						const numOfLocalAssets = localAssetsAsFilePaths.length

						if (numOfLocalAssets) {
							log(`You have ${co.yellow(numOfLocalAssets)} local assets.`)
							log(
								`Checking if we are missing any assets from the ${co.yellow(
									aggregator.configKey,
								)}...`,
							)
						} else {
							u.newline()
							log(
								co.orange(
									`It doesn't seem like you have any asset files. Will look for them now...`,
								),
							)
						}

						const missingAssets = [] as t.State['assets']

						for (const asset of assets) {
							if (!asset.isRemote && asset.filename) {
								if (!localAssetsAsPlainFileNames.includes(asset.filename)) {
									missingAssets.push({
										...asset,
										status: 'downloading',
									})
								}
							}
						}

						const numMissingAssets = missingAssets.length

						if (numMissingAssets) {
							// prettier-ignore
							const color = co[numMissingAssets < 5 ? 'green' : numMissingAssets < 10 ? 'yellow' : 'red']

							log(
								co.orange(
									`You have ${
										u.isFnc(color) ? color(numMissingAssets) : numMissingAssets
									} missing assets. They will be downloaded and saved to ${co.yellow(
										assetsDir,
									)}`,
								),
							)

							u.newline()

							async function downloadAsset(asset: t.State['assets'][number]) {
								if (asset.url) {
									try {
										const progress = download(asset.url, assetsDir)

										progress.on(
											'downloadProgress',
											({
												percent,
											}: {
												percent: number
												transferred: number
												total: number
											}) => {
												if (percent >= 1) {
													setState((draft) => {
														const index = draft.assets.findIndex(
															(obj) => obj.filename === asset.filename,
														)
														if (index > -1) {
															draft.assets.push({
																...asset,
																status: 'downloaded',
															})
														}
													})
												}
											},
										)

										progress.on('response', (res) => {
											log(`[${co.yellow(asset.filename)}] Response`)
										})

										progress.on('error', (err) => {
											const { statusCode, statusMessage } = err
											// File was not found
											if (statusCode == 404) {
												//
											}
											console.log(
												`[${co.red(`Error`)}] [${co.magenta(
													asset.filename,
												)}]: ${co.white(statusMessage)}`,
											)
										})

										progress.on('finish', () => {
											log(`Finished with ${co.yellow(asset.filename)}`)
										})

										// await progress
									} catch (error) {
										log(
											`[${u.red(asset.filename)}]: ${u.yellow(error.message)}`,
										)
									}
								}
							}

							setState({ assets: missingAssets })

							const promises = [] as Promise<any>[]

							for (const missingAsset of missingAssets) {
								if (!missingAsset.url) {
									log(
										co.red(
											`The asset "${co.yellow(
												missingAsset.filename,
											)}" did not contain a download link!`,
										),
									)
									continue
								}
								promises.push(downloadAsset(missingAsset))
							}

							await Promise.all(promises)
							props.onEnd?.()
						} else log(`You are not missing any assets.`)
					}

					function incrementProcessedDocs() {
						processedDocs++
						numDocsFetching && processedDocs > numDocsFetching && done?.()
					}

					function createOnDoc(
						type: 'root-config' | 'app-config' | 'app-page',
					) {
						async function onDoc({
							name,
							doc,
						}: {
							name: string
							doc: yaml.Document
						}) {
							const filename = com.withYmlExt(name).replace('_en', '')
							const filepath = path.join(dir, filename)
							if (!doc) return u.log(doc)

							if (type === 'root-config') {
								await fs.writeFile(filepath, doc.toString(), 'utf8')
								const baseUrl = doc.get('cadlBaseUrl')
								const appKey = doc.get('cadlMain')
								log(`Base url: ${co.yellow(baseUrl)}`)
								log(`App config url: ${co.yellow(`${baseUrl}${appKey}`)}`)
								setState({ configKey })
								log(`Saved root config object to ${co.yellow(filepath)}`)
								incrementProcessedDocs()
							} else if (type === 'app-config') {
								await fs.writeFile(filepath, doc.toString(), 'utf8')
								numDocsFetching = aggregator.pageNames.length
								log(
									`\nTotal expected number of yml files we are retrieving is ${co.yellow(
										numDocsFetching,
									)}`,
								)
								log(`Saved app config to ${co.yellow(filepath)}`)
								incrementProcessedDocs()
							} else {
								await fs.writeFile(filepath, doc.toString(), 'utf8')
								const pageName = name.replace('_en', '')
								log(
									`Saved page ${co.magenta(pageName)} to ${co.yellow(
										filepath,
									)}`,
								)
								incrementProcessedDocs()
							}
						}
						return onDoc
					}

					await aggregator
						.on(ON_RETRIEVED_ROOT_CONFIG, createOnDoc('root-config'))
						.on(PARSED_APP_CONFIG, createOnDoc('app-config'))
						.on(ON_RETRIEVED_APP_PAGE, createOnDoc('app-page'))
						.on(ON_RETRIEVE_APP_PAGE_FAILED, incrementProcessedDocs)
						.init({ loadPages: { includePreloadPages: true } })
				} catch (error) {
					logError(error)
				} finally {
					const { host, port } = props
					const doc = aggregator.root.get(aggregator.configKey) as yaml.Document
					if (props.isLocal) {
						doc.set('cadlBaseUrl', `http://${host}:${port}/`)
						if (doc.has('myBaseUrl')) {
							doc.set('myBaseUrl', `http://${host}:${port}/`)
						}
						const dir = path.join(
							configuration.getPathToGenerateDir(),
							aggregator.configKey,
						)
						const filename = com
							.withYmlExt(aggregator.configKey)
							.replace('_en', '')
						const filepath = path.join(dir, filename)
						await fs.writeFile(filepath, doc.toString(), 'utf8')
					}
				}
			}
		},
		[spinner],
	)

	React.useEffect(() => {
		configValue && validate(configValue)
	}, [])

	const onSubmit = React.useCallback((val: string) => val && validate(val), [])

	const ConfigInput = React.memo(
		() => (
			<UncontrolledTextInput
				placeholder={`Which config should we use? (example: ${co.yellow(
					`testpage`,
				)})`}
				onSubmit={onSubmit}
			/>
		),
		() => true,
	)

	let children: React.ReactNode = null

	if (!valid) {
		if (validating) {
			children = <Text color="white">Validating...</Text>
		} else if (!configValue && lastTried) {
			children = (
				<>
					<Text color="red">The config "{lastTried}" does not exist</Text>
					<Box paddingTop={1}>
						<ConfigInput />
					</Box>
				</>
			)
		}
	} else if (state.assets.length) {
		children = (
			<Static paddingTop={3} items={state.assets as t.State['assets']}>
				{(item) => (
					<Box key={item.url}>
						<Text
							color={item.status === 'downloaded' ? 'greenBright' : 'yellow'}
						>
							{item.status.toUpperCase()}
						</Text>
						<Text> </Text>
						<Text color="white">{item.filename}</Text>
						<Text> </Text>
						<Text color="blue" dimColor>
							[{item.group}]
						</Text>
					</Box>
				)}
			</Static>
		)
	}

	if (!children && !validating && !configValue) children = <ConfigInput />

	return <Panel>{children}</Panel>
}

export default GenerateApp
