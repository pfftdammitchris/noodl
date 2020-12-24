import React from 'react'
import { Box, Newline, Text } from 'ink'
import fs from 'fs-extra'
import chalk from 'chalk'
import produce, { Draft } from 'immer'
import TextInput from 'ink-text-input'
import useCtx from '../useCtx'
import Select from '../components/Select'
import { withJsonExt, withYmlExt } from '../utils/common'

type Ext = 'json' | 'yml' | 'json-yml'

export type Action =
	| { type: 'set-config'; config: string }
	| { type: 'set-ext'; ext: Ext }
	| { type: 'set-status-message'; statusMessage: string }
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
	statusMessage: string
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
	statusMessage: '',
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
		case 'set-status-message':
			if (draft.statusMessage !== action.statusMessage) {
				draft.statusMessage = action.statusMessage
			}
			break
	}
})

function RetrieveObjectsPanel() {
	const [state, dispatch] = React.useReducer(reducer, initialState)
	const [configInput, setConfigInput] = React.useState('')
	const { aggregator, cliConfig } = useCtx()

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
			const exts = state.ext.split('-')

			fs.mkdirpSync(cliConfig.json?.path as string)
			fs.mkdirpSync(cliConfig.yml?.path as string)

			console.log(`Config set to ${chalk.magentaBright(state.config)}`)

			let savedPageCount = 0

			aggregator
				.init({
					version: 'latest',
					loadPages: {
						includePreloadPages: true,
						async onPage(args) {
							if (typeof args === 'object') {
								const { name, json, yml } = args
								try {
									for (let index = 0; index < exts.length; index++) {
										const ext = exts[index] as 'json' | 'yml'
										let filepath = ''
										if (ext === 'json') {
											filepath = withJsonExt(`${cliConfig.json?.path}/${name}`)
											await fs.writeJson(filepath, json, { spaces: 2 })
										} else if (ext === 'yml') {
											filepath = withYmlExt(`${cliConfig.yml?.path}/${name}`)
											await fs.writeFile(filepath, yml, { encoding: 'utf8' })
										}
									}
									savedPageCount++
								} catch (err) {
									console.error(
										`[${chalk.red(`${name} - [${err.name}]`)}]: ${err.message}`,
									)
								}
								console.log(`Saved page ${chalk.yellow(name)}`)
							}
						},
					},
				})
				.then(() => {
					dispatch({
						type: 'set-status-message',
						statusMessage: `Saved ${chalk.yellow(savedPageCount)} pages`,
					})
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
						<Text>{state.statusMessage}</Text>
					</Box>
				) : null}
			</Box>
		</Box>
	)
}

export default RetrieveObjectsPanel
