import * as u from '@jsmanifest/utils'
import invariant from 'invariant'
import React from 'react'
import produce from 'immer'
import { Spacer, Static, Text } from 'ink'
import { Provider } from './useCtx'
import createAggregator from './api/createAggregator'
import HighlightedText from './components/HighlightedText'
import SelectRoute from './panels/SelectRoute'
import ServerFiles from './panels/ServerFiles'
import Spinner from './components/Spinner'
import RetrieveObjects, { Ext } from './panels/RetrieveObjects'
import RetrieveKeywords from './panels/RetrieveKeywords'
import RunServer from './panels/RunServer'
import useSettings from './hooks/useCliConfig'
import { magenta } from './utils/common'
import * as c from './constants'
import * as T from './types'

let aggregator: ReturnType<typeof createAggregator> = createAggregator()

const initialState: T.App.State = {
	caption: [],
	panel: {
		highlightedId: '',
		value: '',
		mounted: false,
		idle: false,
	},
	spinner: false,
}

function reducer(state: T.App.State = initialState, action: T.App.Action) {
	return produce(state, (draft) => {
		switch (action.type) {
			case c.UPDATE_PANEL:
				return void u.assign(draft.panel, action.panel)
			case c.app.action.HIGHLIGHT_PANEL:
				return void (draft.panel.highlightedId = action.panelId)
			case c.app.action.SET_CAPTION:
				return void draft.caption.push(action.caption)
			case c.app.action.SET_SPINNER:
				return void (draft.spinner = action.spinner)
		}
	})
}

function Application({
	cli,
	config,
	defaultPanel,
	ext = 'yml',
	runServer,
}: {
	cli: T.App.Context['cli']
	config?: string
	ext?: Ext
	defaultPanel?: T.App.PanelId
	runServer?: boolean
}) {
	const [state, dispatch] = React.useReducer(reducer, initialState)
	const settings = useSettings({ server: { config: cli.flags.config } })

	const ctx = {
		...state,
		aggregator,
		cli,
		cliArgs: { config, defaultPanel, ext, runServer },
		settings,
		highlightPanel: (panelId: T.App.PanelId) => {
			dispatch({ type: c.app.action.HIGHLIGHT_PANEL, panelId })
		},
		setCaption: (caption: Parameters<T.App.Context['setCaption']>[0]) => {
			dispatch({ type: c.app.action.SET_CAPTION, caption })
		},
		setErrorCaption: (err: Parameters<T.App.Context['setErrorCaption']>[0]) => {
			dispatch({
				type: c.app.action.SET_CAPTION,
				caption:
					err instanceof Error
						? `[${u.red(err.name)}]: ${u.yellow(err.message)}`
						: err,
			})
		},
		toggleSpinner: (type?: Parameters<T.App.Context['toggleSpinner']>[0]) => {
			dispatch({
				type: c.app.action.SET_SPINNER,
				spinner: type === undefined ? 'point' : type === false ? false : type,
			})
		},
		updatePanel: (panel: Partial<T.App.State['panel']>) => {
			dispatch({ type: c.UPDATE_PANEL, panel })
		},
	} as T.App.Context

	React.useEffect(() => {
		if (u.keys(cli.flags).length) {
			const isRetrieving = !!cli.flags.retrieve?.length
			const isStartingServer = !!cli.flags.server

			if (isRetrieving) {
				invariant(
					['json', 'yml'].some((ext) => cli.flags.retrieve?.includes(ext)),
					`Invalid value for "${magenta(
						`retrieve`,
					)}". Valid options are: ${magenta('json')}, ${magenta('yml')}`,
				)
				ctx.updatePanel({
					value: c.panel.RETRIEVE_OBJECTS.value,
					server: isStartingServer,
				})
			} else if (isStartingServer) {
				ctx.updatePanel({ value: c.panel.SERVER_FILES.value })
			}
		} else {
			if (config || defaultPanel) {
				ctx.settings.set((draft) => {
					config && (draft.server.config = config)
					defaultPanel && (draft.defaultPanel = defaultPanel)
				})
				if (runServer) {
					if (!defaultPanel) {
						ctx.updatePanel({ value: c.panel.RETRIEVE_OBJECTS.value })
					} else {
						ctx.updatePanel({ value: defaultPanel })
					}
				}
			}
		}
	}, [config, defaultPanel])

	return (
		<Provider value={ctx}>
			{ctx.spinner ? (
				<HighlightedText color="whiteBright">
					<Spinner type={ctx.spinner} />
				</HighlightedText>
			) : null}
			{state.panel.value === c.panel.RETRIEVE_OBJECTS.value ? (
				<RetrieveObjects
					onEnd={() => {
						if (state.panel.server || runServer) {
							ctx.updatePanel({
								idle: true,
								mounted: false,
								value: c.panel.RUN_SERVER.value,
							})
						}
					}}
				/>
			) : state.panel.value === c.panel.RETRIEVE_KEYWORDS.value ? (
				<RetrieveKeywords />
			) : state.panel.value === c.panel.SERVER_FILES.value ? (
				<ServerFiles />
			) : state.panel.value === c.panel.RUN_SERVER.value ? (
				<RunServer />
			) : (
				<SelectRoute />
			)}
			<Static items={ctx.caption as string[]}>
				{(caption, index) => <Text key={index}>{caption}</Text>}
			</Static>
			<Spacer />
		</Provider>
	)
}

export default Application
