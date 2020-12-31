import React from 'react'
import fs from 'fs-extra'
import path from 'path'
import SelectInput from 'ink-select-input'
import Spinner from 'ink-spinner'
import { UncontrolledTextInput } from 'ink-text-input'
import { Box, BoxProps } from 'ink'
import produce, { Draft } from 'immer'
import { getFilePath, highlight, italic, magenta, red } from '../utils/common'
import useCtx from '../useCtx'
import HighlightedText from '../components/HighlightedText'
import { DEFAULT_SERVER_PATH, serverScript as c } from '../constants'
import * as T from '../types/serverScriptTypes'

const initialState: T.State = {
	config: '',
	dataSource: '',
	dirFiles: [],
	step: c.step.CONFIG,
} as T.State

const reducer = produce(
	(draft: Draft<T.State> = initialState, action: T.Action): void => {
		switch (action.type) {
			case c.action.SET_CONFIG:
				return void (draft.config = action.config)
			case c.action.SET_DATA_SOURCE:
				return void (draft.dataSource = action.dataSource)
			case c.action.SET_STEP:
				return void (draft.step = action.step)
		}
	},
)

function StartServer() {
	const [state, dispatch] = React.useReducer(reducer, initialState)
	const { aggregator, server, setCaption, toggleSpinner } = useCtx()

	const getAssetsFolder = (serverDir: string) => path.join(serverDir, 'assets')

	const onSetConfig = React.useCallback(
		(config: string) => {
			if (!config) return
			dispatch({ type: c.action.SET_CONFIG, config })
			setCaption(`Config set to ${magenta(config)}`)
			if (fs.existsSync(server.dir)) {
				setStep('')
				setCaption('Server dir exists. Scanning now...')
				if (!fs.existsSync(getAssetsFolder(server.dir))) {
					fs.ensureDirSync(getAssetsFolder(server.dir))
					setCaption(
						`Assets folder created at ${magenta(getAssetsFolder(server.dir))}`,
					)
				}
				if (!state?.dataSource) setStep(c.step.PROMPT_DATA_SOURCE)
				// TODO - scan config object and retrieve missing data (images, videos, etc)
			} else {
				setCaption('Server dir does not exist')
				// Confirm to create server dir
				setStep(c.step.PROMPT_SERVER_DIR)
			}

			// if (state?.dataSource === '') {
			// 	dispatch({ type: c.action.SET_STEP, step: c.step.PROMPT_DATA_SOURCE })
			// }
		},
		[server, state?.dataSource],
	)

	const onSetDataSource = React.useCallback((item: any) => {
		dispatch({ type: c.action.SET_DATA_SOURCE, dataSource: item.value })
		setCaption(`Data source set to ${magenta(item.value)}`)
		toggleSpinner()
		if (item.value === 'fs') {
			setCaption(`Retrieving data from ${magenta(server.dir)}...`)
			// aggregator.on()
			// aggregator.init({ loadPages: true })
		} else if (item.value === 'remote') {
			//
		}
	}, [])

	const setStep = React.useCallback((step: T.State['step']) => {
		dispatch({ type: c.action.SET_STEP, step })
		console.log('NEXT STEP: ' + magenta(step || '<none>'))
	}, [])

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
			await fs.ensureDir(DEFAULT_SERVER_PATH)
			setCaption(`Server dir created at ${magenta(DEFAULT_SERVER_PATH)}`)
			await fs.ensureDir(getAssetsFolder(DEFAULT_SERVER_PATH))
			setCaption(
				`Assets folder created at ${magenta(
					getAssetsFolder(DEFAULT_SERVER_PATH),
				)}`,
			)
			setCaption(`Fetching contents from config "${magenta(state?.config)}"`)
		}
	}, [])

	React.useEffect(() => {
		setCaption(`STEP: ${magenta(state?.step)}`)
		setCaption(`Server dir: ${magenta(server.dir)}`)
		setCaption(`Server host: ${magenta(server.host)}`)
		setCaption(`Server port: ${magenta(server.port)}`)
	}, [])

	// Initiate the location of where the data is at
	React.useEffect(() => {
		const hasConfig = state?.config !== ''
		const hasDataSource = ['fs', 'remote'].includes(state?.dataSource || '')
	}, [state?.config, state?.dataSource])

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
			{currentStep === c.step.CONFIG ? (
				<Container label="Which config should we use?">
					<UncontrolledTextInput
						onSubmit={onSetConfig}
						placeholder="Enter the config here"
					/>
				</Container>
			) : currentStep === c.step.PROMPT_DATA_SOURCE ? (
				<Container label="Where is the data going to be retrieved from?">
					<SelectInput
						items={[
							{ label: 'Local (file system)', value: 'fs' },
							{ label: 'Remote', value: 'remote' },
						]}
						onSelect={onSetDataSource}
					/>
				</Container>
			) : currentStep === c.step.CONFIRM_USE_SERVER_DIR_FILES ? (
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
			) : currentStep === c.step.PROMPT_SERVER_DIR ? (
				<Container label="Could not locate a directory for your server. Would you like to create one?">
					<SelectInput
						items={[
							{ label: 'Yes', value: 'yes' },
							{ label: 'no', value: 'no' },
						]}
						onSelect={onCreateServerDir}
					/>
				</Container>
			) : null}
		</>
	)
}

export default StartServer
