import React from 'react'
import { Box } from 'ink'
import produce, { Draft } from 'immer'
import path from 'path'
import fs from 'fs-extra'
import chalk from 'chalk'
import TextInput from 'ink-text-input'
import useCtx from '../useCtx'
import HighlightedText from '../components/HighlightedText'
import Spinner from '../components/Spinner'
import Select from '../components/Select'
import {
	getFilepath,
	magenta,
	yellow,
	saveJson,
	saveYml,
	withJsonExt,
	withYmlExt,
} from '../utils/common'
import * as c from '../constants'

const stepId = {
	SET_EXT: 'set-ext',
	SET_CONFIG: 'set-config',
	RETRIEVING_OBJECTS: 'retrieving-objects',
} as const

export type ActionType = 'set-config' | 'set-ext' | 'set-status'
export type Action =
	| { type: 'set-config'; config: string }
	| { type: 'set-ext'; ext: Ext }
	| { type: 'set-status'; status: State['status'] }
export type Ext = 'json' | 'yml'
export type StepId = typeof stepId[keyof typeof stepId]

export interface State {
	ext: Ext | ''
	config: string
	caption: string[]
	status: 'idle' | 'retrieving-objects'
	step: {
		current: StepId
		items: StepId[]
	}
}

const initialState: State = {
	ext: '',
	config: '',
	caption: [],
	status: 'idle',
	step: {
		current: 'set-ext',
		items: Object.values(stepId),
	},
}

function RetrieveObjectsPanel({
	config: configProp,
	ext: extProp,
	onEnd,
	onError,
}: {
	config?: string
	ext?: State['ext']
	onEnd?(): void
	onError?(err: Error): void
}) {
	const [state, setState] = React.useState(initialState)
	const [configInput, setConfigInput] = React.useState('')
	const { aggregator, settings, setCaption, setErrorCaption } = useCtx()

	const _setState = React.useCallback((fn: (draft: Draft<State>) => void) => {
		setState(produce(fn))
	}, [])

	const items = [
		{ label: 'JSON', value: 'json' },
		{ label: 'YML', value: 'yml' },
	] as const

	React.useEffect(() => {
		const config = configProp || state.config
		const ext = extProp || state.ext

		if (config && ext) {
			async function onObject(
				args: {
					json: Record<string, any> | Record<string, any>[]
					yml: string
				} & { name: string },
			) {
				if (typeof args === 'object') {
					const { name, json, yml } = args
					const withExt = ext === 'json' ? withJsonExt : withYmlExt
					const saveFn = ext === 'json' ? saveJson : saveYml
					try {
						for (let dir of settings.objects[ext]?.dir || []) {
							dir = getFilepath(dir)
							let filepath = withExt(path.join(dir, name))

							if (!fs.existsSync(dir)) {
								await fs.mkdirp(dir)
								setCaption(`Created folder ${magenta(dir)}`)
							}

							saveFn(filepath)(ext === 'json' ? json : yml)
							setCaption(`Saved ${yellow(`${name}.${ext}`)} to ${magenta(dir)}`)
						}
					} catch (error) {
						setCaption(
							`[${chalk.red(`${name} - [${error.name}]`)}]: ${error.message}`,
						)
					}
					savedPageCount++
				}
			}

			setCaption(`Config set to ${chalk.magentaBright(state.config)}\n`)

			let savedPageCount = 0

			_setState((d) => void (d.status = 'retrieving-objects'))

			aggregator
				.on(
					c.aggregator.event.RETRIEVED_ROOT_CONFIG,
					async ({ json, yml }: { json: Record<string, any>; yml: string }) => {
						await onObject({ name: state.config, json, yml })
					},
				)
				.on(c.aggregator.event.RETRIEVED_APP_CONFIG, onObject)
				.on(c.aggregator.event.RETRIEVED_APP_OBJECT, onObject)
				.init({
					version: 'latest',
					loadPages: { includePreloadPages: true },
				})
				.then(() => {
					setCaption(`\nSaved ${chalk.yellow(String(savedPageCount))} objects`)
				})
				.catch((err) => {
					setErrorCaption(err)
					onError?.(err)
				})
				.finally(() => {
					_setState((d) => void (d.status = 'idle'))
					onEnd?.()
				})
		}
	}, [state.config, state.ext, settings.objects])

	return (
		<Box padding={1} flexDirection="column">
			<HighlightedText>
				{!state.ext
					? 'Choose file extension(s)'
					: !state.config
					? 'Which config should we use?'
					: null}
			</HighlightedText>
			<Box flexDirection="column">
				{!state.ext ? (
					<Select
						items={items.slice()}
						onSelect={(item) =>
							_setState((d) => void (d.ext = item.value as Ext))
						}
					/>
				) : !state.config ? (
					<TextInput
						placeholder="Enter text"
						value={configInput}
						onChange={setConfigInput}
						onSubmit={(config) => {
							aggregator.config = config
							_setState((d) => void (d.config = config))
						}}
					/>
				) : null}
			</Box>
			{state.status === 'retrieving-objects' && (
				<HighlightedText color="whiteBright">
					<Spinner />
				</HighlightedText>
			)}
		</Box>
	)
}

RetrieveObjectsPanel.id = c.panel.RETRIEVE_OBJECTS

export default RetrieveObjectsPanel
