import React from 'react'
import yaml from 'yaml'
import fs from 'fs-extra'
import path from 'path'
import { UncontrolledTextInput } from 'ink-text-input'
import { Box, BoxProps } from 'ink'
import produce, { Draft } from 'immer'
import globby from 'globby'
import createObjectScripts from '../api/createObjectScripts'
import {
	captioning,
	deepOrange,
	getFilePath,
	groupAssets,
	highlight,
	magenta,
	newline,
	red,
	saveYml,
} from '../utils/common'
import scriptObjs, { id as scriptId, Store } from '../utils/scripts'
import useCtx from '../useCtx'
import HighlightedText from '../components/HighlightedText'
import StartServerDownloadAssets from './StartServerDownloadAssets'
import StartServerLoadFiles from './StartServerLoadFiles'
import cliConfig from '../cliConfig'
import * as c from '../constants'
import * as T from '../types/serverScriptTypes'
import { ObjectResult } from 'types'

const initialState: T.State = {
	config: '',
	dataSource: '',
	dirFiles: [],
	step: c.serverScript.step.CONFIG,
	steps: [c.serverScript.step.CONFIG, c.serverScript.step.DOWNLOAD_ASSETS],
	stepContext: Object.values(c.serverScript.step).reduce(
		(acc, key) => Object.assign(acc, { [key]: {} }),
		{},
	),
} as T.State

const reducer = produce(
	(draft: Draft<T.State> = initialState, action: T.Action): void => {
		switch (action.type) {
			case c.serverScript.action.SET_CONFIG:
				return void (draft.config = action.config)
			case c.serverScript.action.SET_STEP: {
				draft.step = action.step
				if (action.step === c.serverScript.step.DOWNLOAD_ASSETS) {
					draft.stepContext[c.serverScript.step.DOWNLOAD_ASSETS] = {
						...draft.stepContext[c.serverScript.step.DOWNLOAD_ASSETS],
						assets: action.assets,
					}
				} else {
					if (action.options) {
						Object.assign(
							draft.stepContext[action.step as Exclude<T.State['step'], ''>],
							action.options,
						)
					}
				}
				break
			}
		}
	},
)

function StartServer() {
	const { current: scripts } = React.useRef(createObjectScripts<Store>())
	const [state, dispatch] = React.useReducer(reducer, initialState)
	const { aggregator, setCaption, toggleSpinner } = useCtx()

	const getAssetsFolder = (serverDir: string) => path.join(serverDir, 'assets')

	const onSetConfig = React.useCallback(async (config: string) => {
		// Search server dir for config file
		if (!config) return

		dispatch({ type: c.serverScript.action.SET_CONFIG, config })
		setCaption(`Config set to ${magenta(config)}`)

		const serverPath = getFilePath(cliConfig.server.dir)
		const assetsPath = getAssetsFolder(cliConfig.server.dir)
		const serverPathFound = fs.existsSync(serverPath)
		const assetsPathFound = fs.existsSync(assetsPath)

		// Not found
		if (!serverPathFound) {
			fs.ensureDirSync(serverPath)
			setCaption(`Created server folder at ${magenta(serverPath)}`)
		}
		if (!assetsPathFound) {
			fs.ensureDirSync(magenta(assetsPath))
			setCaption(`Created assets folder at ${magenta(assetsPath)}`)
		}

		// Found
		const configFiles = await globby(
			`${path.join(serverPath, `**/*/${config}.yml`)}`,
		)

		if (!configFiles.length) {
			setCaption(
				`No config files were found for config ${magenta(
					config,
				)}. Retrieving remotely...`,
			)

			const onRetrievedObject = ({
				name,
				yml,
			}: ObjectResult & { name: string }) => {
				const filename = name + '.yml'
				const filepath = getFilePath(cliConfig.server.dir, filename)
				setCaption(
					`Saved ${magenta(filename)} to ${getFilePath(cliConfig.server.dir)}`,
				)
				saveYml(filepath, yml)
			}

			await aggregator
				.on(c.aggregator.event.RETRIEVED_ROOT_CONFIG, onRetrievedObject)
				.on(c.aggregator.event.RETRIEVED_APP_CONFIG, onRetrievedObject)
				.on(c.aggregator.event.RETRIEVED_APP_OBJECT, onRetrievedObject)
				.setConfig(config)
				.setHost(cliConfig.objects.hostname)
				.init({ loadPages: true })

			// Check assets
			setCaption('Checking for missing assets...')
		} else {
			setCaption(
				`Found ${magenta(configFiles.length)} files with ${magenta(
					config,
				)}.\nWould you like to load from this config?`,
			)
		}

		setStep(c.serverScript.step.LOAD_FILES)
	}, [])

	/**
	 * Parallel
	 * 	1. Recursive through config + load pages/assets to dir
	 *	2. Start server
	 */
	const onStart = async () => {
		//
	}

	const onSetDataSource = React.useCallback(
		(item: any) => {
			setStep('')
			setCaption(`Data source set to ${magenta(item.value)}`)
			toggleSpinner()
			setCaption(
				`Retrieving data from ${magenta(getFilePath(cliConfig.server.dir))}`,
			)
			let currentCount = 0
			let failedCount = 0
			let totalPreloadPages = 0
			let totalPages = 0
			aggregator
				.setConfig(state?.config as string)
				.on(c.aggregator.event.RETRIEVED_ROOT_CONFIG, ({ name, json }) => {
					setCaption(`Retrieved ${magenta(name)} config`)
				})
				.on(c.aggregator.event.RETRIEVED_APP_CONFIG, ({ name, json }) => {
					setCaption(`Retrieved app ${magenta(name)} config`)
					totalPreloadPages = json?.preload?.length || 0
					totalPages = json?.page?.length || 0
				})
				.on(c.aggregator.event.RETRIEVE_APP_OBJECT_FAILED, (name) => {
					failedCount++
				})
				.on(c.aggregator.event.RETRIEVED_APP_OBJECT, ({ name }) => {
					currentCount++
					setCaption(
						`Received page ${magenta(name)} (${highlight(
							`${currentCount}/${totalPages}`,
						)})`,
					)
				})
				.init({ loadPages: true })
				.then(([rootConfig, appConfig]) => {
					newline()
					setCaption(
						`Finished with ${magenta(currentCount)} objects ${
							failedCount
								? `(${red(failedCount)} objects were unsuccessful)`
								: ''
						}`,
					)
					newline()
					setCaption(captioning('Checking assets and urls...'))
					newline()
					const docNameMapper = new Map<yaml.Document, string>()
					const ymlDocs = Object.entries(aggregator.get('yml')).reduce(
						(acc, [name, yml]) => {
							const doc = yaml.parseDocument(yml)
							docNameMapper.set(doc, name)
							return acc.concat(doc)
						},
						[] as yaml.Document[],
					)
					scripts.data(ymlDocs)
					scripts
						.use(scriptObjs[scriptId.RETRIEVE_URLS])
						.on('start', (store) => {
							if (!store.urls) store.urls = []
						})
						.on('end', (store) => {
							store.urls = store.urls.sort()
							const assets = groupAssets(store.urls)
							const { images, other, pdfs, videos } = assets
							setCaption(`Found ${magenta(images.length)} image links`)
							setCaption(`Found ${magenta(pdfs.length)} pdf links`)
							setCaption(`Found ${magenta(videos.length)} video links`)
							setCaption(`Found ${magenta(other.length)} other asset links`)
							newline()
							setCaption(
								`Total links: ${magenta(store.urls.length)} in config ${magenta(
									state?.config,
								)}`,
							)
							newline()
							setCaption(captioning(`Downloading assets...`))
							newline()
							setStep(c.serverScript.step.DOWNLOAD_ASSETS, {
								assets: store.urls,
							})
						})
						.run()
				})
		},
		[state],
	)

	const setStep = React.useCallback(
		(step: T.State['step'], stepContext?: any) => {
			dispatch({
				type: c.serverScript.action.SET_STEP,
				step,
				...stepContext,
			})
			console.log(`${deepOrange('STEP')}: ` + magenta(step || '<none>'))
		},
		[],
	)

	const onConfirmUseServerDirFiles = React.useCallback(() => {
		let serverFiles = state?.dirFiles || []
		let assetFiles = [] as string[]
		if (serverFiles.includes('assets')) {
			assetFiles = assetFiles.concat(
				fs.readdirSync(getFilePath(cliConfig.server.dir, 'assets')),
			)
		}
		console.log('asset files', assetFiles)
	}, [state])

	const onCreateServerDir = React.useCallback(
		async ({ value }) => {
			if (value === 'no') {
				setCaption('Starting server from memory...')
				setStep('')
			} else {
				await fs.ensureDir(c.DEFAULT_SERVER_PATH)
				setCaption(`Server dir created at ${magenta(c.DEFAULT_SERVER_PATH)}`)
				await fs.ensureDir(getAssetsFolder(c.DEFAULT_SERVER_PATH))
				setCaption(
					`Assets folder created at ${magenta(
						getAssetsFolder(c.DEFAULT_SERVER_PATH),
					)}`,
				)
				setCaption(`Fetching contents from "${magenta(state?.config)}" config`)
			}
		},
		[state],
	)

	React.useEffect(() => {
		setCaption(`${deepOrange('STEP')}: ${magenta(state?.step)}`)
		setCaption(`Server dir: ${magenta(getFilePath(cliConfig.server.dir))}`)
		setCaption(`Server host: ${magenta(cliConfig.server.host)}`)
		setCaption(`Server port: ${magenta(cliConfig.server.port)}`)
	}, [])

	const Container = React.memo(
		({
			children,
			label,
			...rest
		}: React.PropsWithChildren<BoxProps> & { label?: string }) => (
			<Box flexDirection="column" {...rest}>
				{label ? <HighlightedText>{label}</HighlightedText> : null}
				{children}
			</Box>
		),
	)

	const currentStep = state?.step || ''

	switch (currentStep) {
		case c.serverScript.step.CONFIG:
			return (
				<Container label="Which config should we use?">
					<UncontrolledTextInput
						onSubmit={onSetConfig}
						placeholder="Enter the config here"
					/>
				</Container>
			)
		case c.serverScript.step.DOWNLOAD_ASSETS:
			return (
				<StartServerDownloadAssets
					{...state?.stepContext[c.serverScript.step.DOWNLOAD_ASSETS]}
				/>
			)
		case c.serverScript.step.LOAD_FILES:
			return <StartServerLoadFiles config={state?.config} />
	}

	return null
}

export default StartServer
