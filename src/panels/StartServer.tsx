import React from 'react'
import chalk from 'chalk'
import fs from 'fs-extra'
import SelectInput from 'ink-select-input'
import TextInput from 'ink-text-input'
import { Box, Newline } from 'ink'
import produce, { Draft } from 'immer'
import { getFilePath } from '../utils/common'
import useCtx from '../useCtx'
import HighlightedText from '../components/HighlightedText'
import { serverScript as c } from '../constants'
import * as T from '../types/serverScriptTypes'

const initialState: T.State = {
	config: '',
	dataSource: '',
	dirFiles: [],
	step: c.step.CONFIG,
} as T.State

const reducer = produce(
	(draft: Draft<T.State> = initialState, action: T.Action) => {
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
	const [configInput, setConfigInput] = React.useState('')
	const { server, setCaption } = useCtx()

	const onSetConfig = React.useCallback(
		(config: string) => {
			dispatch({ type: c.action.SET_CONFIG, config })
			setCaption(`Config set to ${chalk.magenta(config)}`)
			console.log(getFilePath(server.dir))
			console.log(getFilePath(server.dir))
			console.log(getFilePath(server.dir))
			console.log(getFilePath(server.dir))
			console.log(getFilePath(server.dir))
			if (fs.existsSync(getFilePath(server.dir))) {
				const dirFiles = fs.readdirSync(getFilePath(server.dir), 'utf8')
				dispatch({ type: c.action.SET_DIR_FILES, dirFiles })
				dispatch({
					type: c.action.SET_STEP,
					step: c.step.CONFIRM_USE_SERVER_DIR_FILES,
				})
				// TODO - scan config object and retrieve missing data (images, videos, etc)
			} else {
				// Confirm to create server dir
				// setStep(c.step.PROMPT_SERVER_DIR)
			}

			// if (state?.dataSource === '') {
			// 	dispatch({ type: c.action.SET_STEP, step: c.step.PROMPT_DATA_SOURCE })
			// }
		},
		[server, state?.dataSource],
	)

	const onSetDataSource = React.useCallback((item: any) => {
		dispatch({ type: c.action.SET_DATA_SOURCE, dataSource: item.value })
		setCaption(`Data source set to ${chalk.magenta(item.value)}`)
	}, [])

	const setStep = React.useCallback(
		(step: T.State['step']) => dispatch({ type: c.action.SET_STEP, step }),
		[],
	)

	const onConfigInputChange = React.useCallback(
		(value: string) => setConfigInput(value),
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

	// Initiate the location of where the data is at
	React.useEffect(() => {
		const hasConfig = state?.config === ''
		const hasDataSource = ['fs', 'remote'].includes(state?.dataSource || '')

		if (
			hasConfig &&
			!hasDataSource &&
			state?.step !== c.step.PROMPT_DATA_SOURCE
		) {
			if (fs.existsSync(getFilePath(server.dir))) {
				const dirFiles = fs.readdirSync(getFilePath(server.dir), 'utf8')
				// TODO - scan config object and retrieve missing data (images, videos, etc)
			} else {
				// Confirm to create server dir
				setStep(c.step.PROMPT_SERVER_DIR)
			}
		}
	}, [state?.config, state?.dataSource])

	// Fetch data from the data source
	React.useEffect(() => {
		if (state?.dataSource === 'fs') {
			//
		} else if (state?.dataSource === 'remote') {
			//
		}
	}, [state?.dataSource])

	const renderStep = () => {
		switch (state?.step) {
			case c.step.CONFIG:
				return (
					<>
						<HighlightedText>Which config should be used?</HighlightedText>
						<TextInput
							value={configInput}
							onChange={onConfigInputChange}
							onSubmit={onSetConfig}
							placeholder="Enter the config here"
						/>
					</>
				)
			case c.step.PROMPT_DATA_SOURCE:
				return (
					<>
						<HighlightedText>
							Where is the data going to be fetched from?
						</HighlightedText>
						<SelectInput
							items={[
								{ label: 'Local (file system)', value: 'fs' },
								{ label: 'Remote', value: 'remote' },
							]}
							onSelect={onSetDataSource}
						/>
					</>
				)
			case c.step.CONFIRM_USE_SERVER_DIR_FILES:
				return (
					<>
						<HighlightedText>
							{state.dirFiles.length
								? `Found ${state.dirFiles} file(s) in your server folder. ` +
								  `Do you want to use this as the server's data?`
								: ''}
						</HighlightedText>
						<SelectInput
							items={[
								{ label: 'Yes', value: 'yes' },
								{ label: 'no', value: 'no' },
							]}
							onSelect={onConfirmUseServerDirFiles}
						/>
					</>
				)
			default:
				return null
		}
	}

	return <Box flexDirection="column">{renderStep()}</Box>
}

export default StartServer
