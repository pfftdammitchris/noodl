import React from 'react'
import yaml from 'yaml'
import fs from 'fs-extra'
import path from 'path'
import SelectInput from 'ink-select-input'
import { UncontrolledTextInput } from 'ink-text-input'
import { Box, BoxProps } from 'ink'
import produce, { Draft } from 'immer'
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
} from '../utils/common'
import scriptObjs, { id as scriptId, Store } from '../utils/scripts'
import useCtx from '../useCtx'
import HighlightedText from '../components/HighlightedText'
import StartServerDownloadAssets from './StartServerDownloadAssets'
import * as c from '../constants'
import * as T from '../types/serverScriptTypes'

const initialState: T.State = {
	config: '',
	dataSource: '',
	dirFiles: [],
	step: c.serverScript.step.CONFIG,
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
			case c.serverScript.action.SET_DATA_SOURCE:
				return void (draft.dataSource = action.dataSource)
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
	const { aggregator, ownConfig, server, setCaption, toggleSpinner } = useCtx()

	const getAssetsFolder = (serverDir: string) => path.join(serverDir, 'assets')

	const onSetConfig = React.useCallback(
		(config: string) => {
			if (!config) return
			dispatch({ type: c.serverScript.action.SET_CONFIG, config })
			setCaption(`Config set to ${magenta(config)}`)
			if (fs.existsSync(server.dir)) {
				setStep('')
				setCaption(captioning('Server dir exists. Scanning now...'))
				if (!fs.existsSync(getAssetsFolder(server.dir))) {
					fs.ensureDirSync(getAssetsFolder(server.dir))
					setCaption(
						`Assets folder created at ${magenta(getAssetsFolder(server.dir))}`,
					)
				}
				if (!state?.dataSource) setStep(c.serverScript.step.PROMPT_DATA_SOURCE)
				// TODO - scan config object and retrieve missing data (images, videos, etc)
			} else {
				setCaption('Server dir does not exist')
				// Confirm to create server dir
				setStep(c.serverScript.step.PROMPT_SERVER_DIR)
			}

			// if (state?.dataSource === '') {
			// 	dispatch({ type: c.action.SET_STEP, step: c.step.PROMPT_DATA_SOURCE })
			// }
		},
		[server, state?.dataSource],
	)

	const onSetDataSource = React.useCallback(
		(item: any) => {
			dispatch({
				type: c.serverScript.action.SET_DATA_SOURCE,
				dataSource: item.value,
			})
			setStep('')
			setCaption(`Data source set to ${magenta(item.value)}`)
			toggleSpinner()
			if (item.value === 'fs') {
				setCaption(`Retrieving data from ${magenta(server.dir)}`)
				let currentCount = 0
				let failedCount = 0
				let totalPreloadPages = 0
				let totalPages = 0
				aggregator
					.on(c.aggregator.event.RETRIEVED_APP_CONFIG, ({ json }) => {
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
									`Total links: ${magenta(
										store.urls.length,
									)} in config ${magenta(state?.config)}`,
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
			} else if (item.value === 'remote') {
				//
			}
		},
		[state],
	)

	const setStep = React.useCallback(
		(step: T.State['step'], stepContext?: any) => {
			dispatch({
				type: c.serverScript.action.SET_STEP,
				step,
				options: stepContext,
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
				fs.readdirSync(getFilePath(server.dir, 'assets')),
			)
		}
		console.log('asset files', assetFiles)
	}, [state, server])

	const onCreateServerDir = React.useCallback(async ({ value }) => {
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
			setCaption(`Fetching contents from config "${magenta(state?.config)}"`)
		}
	}, [])

	React.useEffect(() => {
		setCaption(`${deepOrange('STEP')}: ${magenta(state?.step)}`)
		setCaption(`Server dir: ${magenta(server.dir)}`)
		setCaption(`Server host: ${magenta(server.host)}`)
		setCaption(`Server port: ${magenta(server.port)}`)
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

	const currentStep = state?.step

	return (
		<>
			{currentStep === c.serverScript.step.CONFIG ? (
				<Container label="Which config should we use?">
					<UncontrolledTextInput
						onSubmit={onSetConfig}
						placeholder="Enter the config here"
					/>
				</Container>
			) : currentStep === c.serverScript.step.PROMPT_DATA_SOURCE ? (
				<Container label="Where is the data going to be retrieved from?">
					<SelectInput
						items={[
							{ label: 'Local (file system)', value: 'fs' },
							{ label: 'Remote', value: 'remote' },
						]}
						onSelect={onSetDataSource}
					/>
				</Container>
			) : currentStep === c.serverScript.step.CONFIRM_USE_SERVER_DIR_FILES ? (
				<Container
					label={
						state?.dirFiles.length
							? `Found ${state?.dirFiles} file(s) in your server folder. ` +
							  `Do you want to use this as the server's data?`
							: ''
					}
				>
					<SelectInput
						items={[
							{ label: 'Yes', value: 'yes' },
							{ label: 'no', value: 'no' },
						]}
						onSelect={onConfirmUseServerDirFiles}
					/>
				</Container>
			) : currentStep === c.serverScript.step.PROMPT_SERVER_DIR ? (
				<Container label="Could not locate a directory for your server. Would you like to create one?">
					<SelectInput
						items={[
							{ label: 'Yes', value: 'yes' },
							{ label: 'no', value: 'no' },
						]}
						onSelect={onCreateServerDir}
					/>
				</Container>
			) : currentStep === c.serverScript.step.DOWNLOAD_ASSETS ? (
				<StartServerDownloadAssets
					assets={
						state?.stepContext[c.serverScript.step.DOWNLOAD_ASSETS]
							?.assets as string[]
					}
				/>
			) : null}
		</>
	)
}

export default StartServer
