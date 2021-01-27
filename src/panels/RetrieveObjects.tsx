import React from 'react'
import { WritableDraft } from 'immer/dist/internal'
import { Box } from 'ink'
import produce from 'immer'
import path from 'path'
import fs from 'fs-extra'
import chalk from 'chalk'
import TextInput from 'ink-text-input'
import Spinner from 'ink-spinner'
import useCtx from '../useCtx'
import HighlightedText from '../components/HighlightedText'
import Select from '../components/Select'
import {
	getFilePath,
	magenta,
	yellow,
	saveJson,
	saveYml,
	withJsonExt,
	withYmlExt,
} from '../utils/common'
import cliConfig from '../cliConfig'
import * as c from '../constants'
import { ObjectResult } from '../types'

const actionId = c.retrieveObjectsScript.action
const stepId = c.retrieveObjectsScript.step
const statusId = c.retrieveObjectsScript.status

export type Ext = 'json' | 'yml' | 'json-yml'

export type Action =
	| { type: typeof actionId.SET_CAPTION; caption: string }
	| { type: typeof actionId.SET_CONFIG; config: string }
	| { type: typeof actionId.SET_EXT; ext: Ext }
	| { type: typeof actionId.SET_STATUS; status: State['status'] }

export interface State {
	ext: Ext | ''
	config: string
	caption: string[]
	status: typeof statusId[keyof typeof statusId]
	step: {
		current: typeof stepId[keyof typeof stepId]
		items: State['step']['current'][]
	}
}

const initialState: State = {
	ext: '',
	config: '',
	caption: [],
	status: statusId.IDLE,
	step: {
		current: stepId.SET_EXT,
		items: [stepId.SET_EXT, stepId.SET_CONFIG, stepId.RETRIEVE_OBJECTS],
	},
}

const reducer = produce((draft: WritableDraft<State>, action: Action): void => {
	switch (action.type) {
		case actionId.SET_EXT:
			draft.ext = action.ext
			draft.step.current = stepId.SET_CONFIG
			break
		case actionId.SET_CONFIG:
			draft.config = action.config
			draft.step.current = stepId.RETRIEVE_OBJECTS
			break
		case actionId.SET_CAPTION:
			return void (
				!draft.caption.includes(action.caption) &&
				draft.caption.push(action.caption)
			)
		case actionId.SET_STATUS:
			return void (
				draft.status !== action.status && (draft.status = action.status)
			)
	}
})

function RetrieveObjectsPanel() {
	const [state, dispatch] = React.useReducer(reducer, initialState)
	const [configInput, setConfigInput] = React.useState('')
	const { aggregator, setCaption, setErrorCaption } = useCtx()

	const items = [
		{ label: 'JSON + YML', value: 'json-yml' },
		{ label: 'JSON', value: 'json' },
		{ label: 'YML', value: 'yml' },
	]

	const onSelectExt = React.useCallback(
		(item) => dispatch({ type: actionId.SET_EXT, ext: item.value }),
		[],
	)

	const onConfigInputChange = React.useCallback(
		(input) => setConfigInput(input),
		[],
	)

	const onSubmitConfig = React.useCallback((config) => {
		aggregator.setConfigId(config)
		dispatch({ type: stepId.SET_CONFIG, config })
	}, [])

	React.useEffect(() => {
		if (state.config) {
			const exts = state.ext.split('-') as Exclude<Ext, 'json-yml'>[]

			async function onNOODLObject(args: ObjectResult & { name: string }) {
				if (typeof args === 'object') {
					const { name, json, yml } = args
					for (let ext of exts) {
						const withExt = ext === 'json' ? withJsonExt : withYmlExt
						const saveFn = ext === 'json' ? saveJson : saveYml
						try {
							for (
								let index = 0;
								index < cliConfig.objects[ext].dir?.length || 0;
								index++
							) {
								let dir = cliConfig.objects[ext].dir[index]
								let filepath: string
								if (dir) {
									dir = getFilePath(dir)
									filepath = withExt(path.join(dir, name))
									const save = saveFn(filepath)

									if (!fs.existsSync(dir)) {
										await fs.mkdirp(dir)
										setCaption(`Created folder ${magenta(dir)}`)
									}

									save(ext === 'json' ? json : yml)
									setCaption(
										`Saved ${yellow(`${name}.${ext}`)} to ${magenta(dir)}`,
									)
								}
							}
						} catch (error) {
							setCaption(
								`[${chalk.red(`${name} - [${error.name}]`)}]: ${error.message}`,
							)
						}
					}
					savedPageCount++
				}
			}

			setCaption(`Config set to ${chalk.magentaBright(state.config)}\n`)

			let savedPageCount = 0
			dispatch({
				type: actionId.SET_STATUS,
				status: statusId.RETRIEVING_OBJECTS,
			})
			aggregator
				.on(c.aggregator.event.RETRIEVED_ROOT_CONFIG, async ({ json, yml }) => {
					await onNOODLObject({ name: state.config, json, yml })
				})
				.on(c.aggregator.event.RETRIEVED_APP_CONFIG, onNOODLObject)
				// .on(c.aggregator.event.RETRIEVED_APP_OBJECT)
				.init({
					version: 'latest',
					loadPages: {
						includePreloadPages: true,
						onPage: onNOODLObject as any,
					},
				})
				.then(() => {
					setCaption(`\nSaved ${chalk.yellow(savedPageCount)} objects`)
				})
				.catch(setErrorCaption)
				.finally(() =>
					dispatch({ type: actionId.SET_STATUS, status: statusId.IDLE }),
				)
		}
	}, [state.config])

	return (
		<Box padding={1} flexDirection="column">
			<HighlightedText>
				{!state.ext
					? 'Choose extensions (Select an item)'
					: !state.config
					? 'Which config should we use?'
					: null}
			</HighlightedText>
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
				) : null}
			</Box>
			{state.status === statusId.RETRIEVING_OBJECTS && (
				<HighlightedText color="whiteBright">
					<Spinner type="point" interval={80} />
				</HighlightedText>
			)}
		</Box>
	)
}

export default RetrieveObjectsPanel
