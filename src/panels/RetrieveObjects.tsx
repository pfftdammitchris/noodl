import React from 'react'
import chalk from 'chalk'
import produce, { Draft } from 'immer'
import { Box, Newline, Text } from 'ink'
import TextInput from 'ink-text-input'
import useCtx from '../useCtx'
import Select from '../components/Select'

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
		case 'add-object': {
			if (action.json || action.yml) {
				if (action.json) Object.assign(draft.objects.json, action.json)
				if (action.yml) Object.assign(draft.objects.yml, action.yml)
			}
			break
		}
		case 'remove-object': {
			if (action.json) {
				;(Array.isArray(action.json) ? action.json : [action.json]).forEach(
					(key) => delete draft.objects.json[key],
				)
			}
			if (action.yml) {
				;(Array.isArray(action.yml) ? action.yml : [action.yml]).forEach(
					(key) => delete draft.objects.yml[key],
				)
			}
			break
		}
	}
})

function RetrieveObjectsPanel() {
	const [state, dispatch] = React.useReducer(reducer, initialState)
	const { aggregator } = useCtx()
	const [configInput, setConfigInput] = React.useState('')

	const addObj = React.useCallback((opts: { json?: any; yml?: any }) => {
		dispatch({ type: 'add-object', ...opts })
	}, [])

	const items = [
		{ label: 'JSON', value: 'json' },
		{ label: 'YML', value: 'yml' },
		{ label: 'JSON + YML', value: 'json-yml' },
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
		aggregator.setConfig(state.config)
		dispatch({ type: 'set-config', config })
	}, [])

	React.useEffect(() => {
		if (state.config) {
			console.log(`Config set to ${chalk.magentaBright(state.config)}`)
			aggregator
				.init()
				.then(([rootConfig, appConfig]) => {
					console.log('Retrieved root config')
					console.log('Retrieved app config [cadlEndpoint]')
				})
				.catch((err) => {
					console.error(`[${chalk.red(err.name)}]: ${err.message}`)
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
