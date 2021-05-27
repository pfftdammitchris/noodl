import React from 'react'
import * as u from '@jsmanifest/utils'
import { Box } from 'ink'
import produce, { Draft } from 'immer'
import path from 'path'
import fs from 'fs-extra'
import TextInput from 'ink-text-input'
import useCtx from '../useCtx'
import HighlightedText from '../components/HighlightedText'
import Spinner from '../components/Spinner'
import Select from '../components/Select'
import {
	getAbsFilePath,
	saveJson,
	saveYml,
	withJsonExt,
	withYmlExt,
} from '../utils/common'
import * as co from '../utils/color'
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
		items: u.values(stepId),
	},
}

function RetrieveObjectsPanel({
	onEnd,
	onError,
}: {
	config?: string
	ext?: State['ext']
	onEnd?(): void
	onError?(err: Error): void
}) {
	const [configInput, setConfigInput] = React.useState('')
	const { aggregator, cli, settings, log, logError } = useCtx()
	const [state, setState] = React.useState(() => ({
		...initialState,
		ext: cli.flags.retrieve || ('' as any),
		config: cli.flags.config || cli.flags.config || '',
	}))

	const _setState = React.useCallback((fn: (draft: Draft<State>) => void) => {
		setState(produce(fn))
	}, [])

	const items = [
		{ label: 'JSON', value: 'json' },
		{ label: 'YML', value: 'yml' },
	] as const

	React.useEffect(() => {
		const config = cli.flags.config || cli.flags.config || state.config
		// TODO - Added "ext" flag
		const ext = cli.flags.retrieve || cli.flags.ext || state.ext

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
							dir = getAbsFilePath(dir)
							let filepath = withExt(path.join(dir, name))

							if (!fs.existsSync(dir)) {
								await fs.mkdirp(dir)
								log(`Created folder ${co.magenta(dir)}`)
							}

							saveFn(filepath)(ext === 'json' ? json : yml)
							log(`Saved ${co.yellow(`${name}.${ext}`)} to ${co.magenta(dir)}`)
						}
					} catch (error) {
						log(`[${co.red(`${name} - [${error.name}]`)}]: ${error.message}`)
					}
					savedPageCount++
				}
			}

			log(`\nConfig set to ${co.magenta(state.config)}\n`)

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
					log(`\nSaved ${co.yellow(String(savedPageCount))} objects`)
				})
				.catch((err) => {
					logError(err)
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
			{!(cli.flags.config || cli.flags.server ? true : false) && (
				<HighlightedText>
					{!state.ext
						? 'Choose file extension(s)'
						: !state.config
						? 'Which config should we use?'
						: null}
				</HighlightedText>
			)}
			<Box paddingTop={1} flexDirection="column">
				{!cli.flags.config && !cli.flags.server && (
					<>
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
					</>
				)}
			</Box>
			{state.status === 'retrieving-objects' && (
				<HighlightedText color="whiteBright">
					<Spinner />
				</HighlightedText>
			)}
		</Box>
	)
}

export default RetrieveObjectsPanel
