// @ts-nocheck
import React from 'react'
import { WritableDraft } from 'immer/dist/internal'
import { Box, Newline, Text } from 'ink'
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
	white,
	withJsonExt,
	withYmlExt,
} from '../utils/common'
import * as c from '../constants'
import { ObjectResult } from 'types'

type Ext = 'json' | 'yml' | 'json-yml'

export type Action =
	| { type: 'set-caption'; caption: string }
	| { type: 'set-config'; config: string }
	| { type: 'set-ext'; ext: Ext }
	| { type: 'set-status'; status: State['status'] }

export interface State {
	ext: Ext | ''
	config: string
	caption: string[]
	status: 'idle' | 'fetching-objects'
	step: {
		current: 'set-ext' | 'set-config' | 'fetch-objects'
		items: State['step']['current'][]
	}
}

const initialState: State = {
	ext: '',
	config: '',
	caption: [],
	status: 'idle',
	step: {
		current: 'set-ext',
		items: ['set-ext', 'set-config', 'fetch-objects'],
	},
}

const reducer = produce((draft: WritableDraft<State>, action: Action): void => {
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
		case 'set-caption':
			return void (
				!draft.caption.includes(action.caption) &&
				draft.caption.push(action.caption)
			)
		case 'set-status':
			return void (
				draft.status !== action.status && (draft.status = action.status)
			)
	}
})

function RetrieveObjectsPanel() {
	const [state, dispatch] = React.useReducer(reducer, initialState)
	const [configInput, setConfigInput] = React.useState('')
	const { aggregator, objects, setCaption, setErrorCaption } = useCtx()

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
			async function onNOODLObject(args: ObjectResult & { name: string }) {
				if (typeof args === 'object') {
					const { name, json, yml } = args
					for (let ext of exts) {
						try {
							for (
								let index = 0;
								index < (objects as any)[ext].dir.length;
								index++
							) {
								let dir = (objects as any)[ext].dir[index]
								if (dir) {
									dir = path.resolve(process.cwd(), dir)
									await fs.mkdirp(dir)
									if (ext === 'json') {
										await fs.writeJson(withJsonExt((dir, name)), json, {
											spaces: 2,
										})
										setCaption(
											`Saved ${chalk.yellow(`${name}.${ext}`)} to ${magenta(
												dir,
											)}`,
										)
									}
									if (ext === 'yml') {
										await fs.writeFile(withYmlExt((dir, name)), yml, {
											encoding: 'utf8',
										})
										setCaption(
											`Saved ${chalk.yellow(`${name}.${ext}`)} to ${magenta(
												dir,
											)}`,
										)
									}
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
			const exts = state.ext.split('-')
			let savedPageCount = 0
			dispatch({ type: 'set-status', status: 'fetching-objects' })
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
						onPage: onNOODLObject,
					},
				})
				.then(() => {
					setCaption(`\nSaved ${chalk.yellow(savedPageCount)} objects`)
				})
				.catch(setErrorCaption)
				.finally(() => dispatch({ type: 'set-status', status: 'idle' }))
		}
	}, [state.config])

	return (
		<Box padding={1} flexDirection="column">
			<HighlightedText>
				{!state.ext
					? 'Fetch these extensions (Select one):'
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
			{state.status === 'fetching-objects' && (
				<HighlightedText color="whiteBright">
					<Spinner type="point" interval={80} />
				</HighlightedText>
			)}
		</Box>
	)
}

export default RetrieveObjectsPanel
