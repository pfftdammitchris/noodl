import React from 'react'
import { Box, Newline, Text } from 'ink'
import fs from 'fs-extra'
import chalk from 'chalk'
import produce, { Draft } from 'immer'
import TextInput from 'ink-text-input'
import useCtx from '../useCtx'
import Select from '../components/Select'
import { getFilePath } from '../utils/common'

type Ext = 'json' | 'yml' | 'json-yml'

export type Action =
	| { type: 'set-config'; config: string }
	| { type: 'set-ext'; ext: Ext }
	| {
			type: 'add-object'
			json?: { [key: string]: { [key: string]: any } }
			yml?: { [key: string]: string }
	  }
	| { type: 'remove-object'; json?: string | string[]; yml?: string | string[] }

export interface State {
	ext: Ext | ''
	config: string
	objects: {
		json: { [name: string]: { [key: string]: any } }
		yml: { [name: string]: string }
	}
	status: null | 'fetching-root-config' | 'fetching-app-config'
	step: {
		current: 'set-ext' | 'set-config' | 'fetch-objects'
		items: State['step']['current'][]
	}
}

const initialState: State = {
	ext: '',
	config: '',
	objects: {
		json: {},
		yml: {},
	},
	status: null,
	step: {
		current: 'set-ext',
		items: ['set-ext', 'set-config', 'fetch-objects'],
	},
}

const reducer = produce((draft: Draft<State>, action: Action) => {
	switch (action.type) {
		case 'set-ext':
			if (draft.ext !== action.ext) {
				draft.ext = action.ext
				draft.step.current = 'set-config'
			}
			break
		case 'set-config':
			if (draft.config !== action.config) {
				draft.config = action.config
				draft.step.current = 'fetch-objects'
			}
			break
	}
})

function RetrieveObjectsPanel() {
	const [state, dispatch] = React.useReducer(reducer, initialState)
	const [configInput, setConfigInput] = React.useState('')
	const { aggregator } = useCtx()

	const items = [
		{ label: 'JSON + YML', value: 'json-yml' },
		{ label: 'JSON', value: 'json' },
		{ label: 'YML', value: 'yml' },
	]

	const onSelectExt = React.useCallback(
		(item) => dispatch({ type: 'set-ext', ext: item.value }),
		[],
	)

	const onConfigInputChange = React.useCallback(
		(input) => setConfigInput(input),
		[],
	)

	const onSubmitConfig = React.useCallback((config) => {
		aggregator.setConfig(config)
		dispatch({ type: 'set-config', config })
	}, [])

	React.useEffect(() => {
		if (state.config) {
			console.log(`Config set to ${chalk.magentaBright(state.config)}`)
			aggregator
				.init({ loadPreloadPages: true;qq loadPages: true, version: 'latest' })
				.then(async ([rootConfig, appConfig]) => {
					console.log('Retrieved root config')
					console.log('Retrieved app config [cadlEndpoint]')
					const writeOpts = { spaces: 2 }
					const pathToJsonFolder = getFilePath('./data/objects/json/')
					const pathToYmlFolder = getFilePath('./data/objects/yml/')
					const exts = state.ext.split('-')
					for (let index = 0; index < exts.length; index++) {
						const ext = exts[index] as 'json' | 'yml'
						console.log(ext)
						console.log(aggregator.get(ext))
						fs.writeJsonSync(
							ext === 'json' ? pathToJsonFolder : pathToYmlFolder,
							aggregator.get(ext),
							writeOpts,
						)
					}
				})
				.catch((err) => {
					// console.error(`[${chalk.red(err.name)}]: ${err.message}`)
					console.error(err)
				})
		}
	}, [state.config])

	return (
		<Box padding={1} flexDirection="column">
			<Text color="yellow">
				{!state.ext
					? 'Fetch these extensions (Select one):'
					: !state.config
					? 'Which config should we use?'
					: null}
			</Text>
			<Newline />
			<Box flexDirection="column">
				{!state.ext ? (
					<Select items={items} onSelect={onSelectExt} />
				) : !state.config ? (
					<TextInput
						value={configInput}
						onChange={onConfigInputChange}
						onSubmit={onSubmitConfig}
						placeholder="Enter text"
					/>
				) : state.config && state.ext ? (
					<Box padding={1} flexDirection="column">
						<Text>Fetching...</Text>
					</Box>
				) : null}
			</Box>
		</Box>
	)
}

export default RetrieveObjectsPanel
