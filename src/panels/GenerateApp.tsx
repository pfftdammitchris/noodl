import { Box, Static, Text } from 'ink'
import { UncontrolledTextInput } from 'ink-text-input'
import {
	getFileStructure,
	LinkStructure,
	normalizePath,
	writeFileSync,
} from 'noodl-common'
import globby from 'globby'
import * as com from 'noodl-common'
import * as u from '@jsmanifest/utils'
import chalk from 'chalk'
import React from 'react'
import yaml from 'yaml'
import fs from 'fs-extra'
import path from 'path'
import Panel from '../components/Panel'
import useConfigInput from '../hooks/useConfigInput'
import useCtx from '../useCtx'
import useDownload from '../hooks/useDownload'
import { constants as noodlAggregatorConsts } from 'noodl-aggregator'
import * as co from '../utils/color'
import * as r from '../utils/remote'

const {
	ON_RETRIEVED_ROOT_CONFIG,
	ON_RETRIEVE_APP_PAGE_FAILED,
	ON_RETRIEVED_APP_PAGE,
	PARSED_APP_CONFIG,
} = noodlAggregatorConsts

export interface Props {
	config?: string
	configVersion?: string
	isLocal?: boolean
	port?: number
	onEnd?(): void
}

export const initialState = {
	configKey: '',
	assets: [] as Array<
		{
			status: 'downloading' | 'downloaded' | 'does-not-exist'
		} & LinkStructure
	>,
}

function GenerateApp(props: Props) {
	const { aggregator, configuration, log, logError, spinner, toggleSpinner } =
		useCtx()

	const { download, downloading, downloaded, urlsDownloaded, urlsInProgress } =
		useDownload()

	const host = `127.0.0.1`
	const {
		config: configProp,
		configVersion: configVersionProp,
		isLocal,
		port,
		onEnd,
	} = props

	const {
		config: configValue,
		lastTried,
		valid,
		validate,
		validating,
	} = useConfigInput({
		initialValue: configProp,
		onValidated: (value) => loadConfig(value),
		onNotFound: (value) => {},
		onValidateStart: () => toggleSpinner(),
		onValidateEnd: () => toggleSpinner(false),
	})

	const loadConfig = React.useCallback(
		async (configKey: string) => {
			if (configKey) {
				try {
					log(`\nLoading config ${co.yellow(`${configKey}`)}`)

					const yml = await r.getConfig(configKey)
					const configFileName = !configKey.endsWith('.yml')
						? `${configKey}.yml`
						: configKey

					const configDir = path.join(
						configuration.getPathToGenerateDir(),
						configKey,
					)
					const configFilePath = path.join(configDir, configFileName)
					const assetsDir = path.join(configDir, 'assets')

					await fs.ensureFile(configFilePath)
					writeFileSync(configFilePath, yml)

					log(`Saved ${co.yellow(configFileName)} to folder`)
					aggregator.configKey = configKey
					log(`Setting env to ${co.yellow('test')}`)
					aggregator.env = 'test'
					log(`Retrieving the config version for ${co.yellow('web')}`)
					aggregator.deviceType = 'web'
					aggregator.configVersion = configVersionProp as string

					if (
						aggregator.configVersion &&
						aggregator.configVersion !== 'latest'
					) {
						log(
							`Config version set to ${co.yellow(aggregator.configVersion)}${
								configVersionProp === 'latest'
									? ` (using option "${co.yellow('latest')}")`
									: ''
							}`,
						)
					}

					log(`Yml files will be saved to ${co.yellow(configDir)}`)
					log(`Asset files will be saved to ${co.yellow(assetsDir)}`)

					if (!fs.existsSync(configDir)) {
						await fs.ensureDir(configDir)
						log(`Created output directory: ${co.yellow(configDir)}`)
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

						for (const filepath of globby.sync(path.join(assetsDir, '**/*'), {
							onlyFiles: true,
						})) {
							const fileStructure = getFileStructure(filepath, {
								config: configKey,
							})
							localAssetsAsPlainFileNames.push(fileStructure.filename)
							localAssetsAsFilePaths.push(fileStructure.filepath)
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

						const missingAssets = [] as typeof initialState['assets']

						for (const asset of assets) {
							if (asset.filename) {
								if (!localAssetsAsPlainFileNames.includes(asset.filename)) {
									missingAssets.push({ ...asset, status: 'downloading' })
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

							const promises = [] as any[]

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
								// promises.push(downloadAsset(missingAsset))
								promises.push(
									download({ url: missingAsset.url, destination: assetsDir }),
								)
							}

							await Promise.all(promises)
							onEnd?.()
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
							const filepath = path
								.join(configDir, filename)
								.replace('/~/', '/')
							if (!doc) return u.log(doc)

							if (type === 'root-config') {
								writeFileSync(filepath, com.stringifyDoc(doc))
								const baseUrl = doc.get('cadlBaseUrl')
								const appKey = doc.get('cadlMain')
								log(`Base url: ${co.yellow(baseUrl)}`)
								log(`App config url: ${co.yellow(`${baseUrl}${appKey}`)}`)
								log(`Saved root config object to ${co.yellow(filepath)}`)
								incrementProcessedDocs()
							} else if (type === 'app-config') {
								writeFileSync(filepath, com.stringifyDoc(doc))
								numDocsFetching = aggregator.pageNames.length
								log(
									`\nTotal expected number of yml files we are retrieving is ${co.yellow(
										numDocsFetching,
									)}`,
								)

								log(`Saved app config to ${co.yellow(filepath)}`)
								incrementProcessedDocs()
							} else {
								writeFileSync(filepath, com.stringifyDoc(doc))
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
						.init({
							fallback: {
								appConfig: async () => {
									const pathsToFallbackFile = normalizePath(
										...[configDir, 'cadlEndpoint.yml'],
									)
									console.log(
										`Callback fired for appConfig loader using config file ` +
											`path: ${chalk.yellow(pathsToFallbackFile)}`,
									)
									return fs.readFile(pathsToFallbackFile, 'utf8')
								},
							},
						})
				} catch (error) {
					logError(error)
				} finally {
					const doc = aggregator.root.get(aggregator.configKey) as yaml.Document
					if (isLocal) {
						log(
							`Setting ${co.magenta('cadlBaseUrl')} to ${co.yellow(
								`http://${host}:${port}/`,
							)}`,
						)
						doc.set('cadlBaseUrl', `http://${host}:${port}/`)
						if (doc.has('myBaseUrl')) {
							log(
								`Setting ${co.magenta('myBaseUrl')} to ${co.yellow(
									`http://${host}:${port}/`,
								)}`,
							)
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
						writeFileSync(filepath, com.stringifyDoc(doc))
					}
				}
			}
		},
		[spinner],
	)

	React.useEffect(() => {
		configValue && validate(configValue)
	}, [])

	const memoizedUrlsDownloaded = React.useMemo(
		() => urlsDownloaded,
		[urlsDownloaded.length],
	)
	const memoizedUrlsInProgress = React.useMemo(
		() => urlsInProgress,
		[urlsInProgress.length],
	)
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
	} else {
		if (memoizedUrlsInProgress.length) {
			children = (
				<Static style={{ paddingTop: 3 }} items={memoizedUrlsInProgress}>
					{(url) => (
						<Box key={url}>
							<Text color="yellow">DOWNLOADING</Text>
							<Text> </Text>
							<Text color="white">{url}</Text>
						</Box>
					)}
				</Static>
			)
		}
	}

	if (!children && !validating && !configValue) children = <ConfigInput />

	return <Panel>{children}</Panel>
}

export default GenerateApp
