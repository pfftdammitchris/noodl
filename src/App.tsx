import React from 'react'
import produce from 'immer'
import { Spacer, Static, Text } from 'ink'
import { Provider } from './useCtx'
import createAggregator from './api/createAggregator'
import HighlightedText from './components/HighlightedText'
import SelectRoute from './panels/SelectRoute'
import ServerFiles from './panels/ServerFiles'
import Spinner from './components/Spinner'
import RetrieveObjects from './panels/RetrieveObjects'
import RetrieveKeywords from './panels/RetrieveKeywords'
import RunServer from './panels/RunServer'
import useSettings from './hooks/useCliConfig'
import * as u from './utils/common'
import * as c from './constants'
import * as T from './types'

let aggregator: ReturnType<typeof createAggregator> = createAggregator()

const initialState: T.App.State = {
	caption: [],
	panel: {
		value: '',
		mounted: false,
		idle: false,
	},
	spinner: false,
}

function reducer(state: T.App.State = initialState, action: T.App.Action) {
	return produce(state, (draft) => {
		switch (action.type) {
			case c.EDIT_PANEL:
				return void Object.assign(draft.panel, action.panel)
			case c.app.action.SET_CAPTION:
				return void draft.caption.push(action.caption)
			case c.app.action.SET_PANEL:
				return void Object.keys(action.panel).forEach(
					(key) => (draft.panel[key] = action.panel[key]),
				)
			case c.app.action.SET_SPINNER:
				return void (draft.spinner = action.spinner)
		}
	})
}

function Application({
	config,
	help = '',
	panelId,
	runServer,
}: {
	config?: string
	help?: string
	panelId?: T.App.PanelId
	runServer?: boolean
}) {
	const [state, dispatch] = React.useReducer(reducer, initialState)
	const settings = useSettings()

	const ctx = {
		...state,
		aggregator,
		settings,
		setPanel: (panel: Parameters<T.App.Context['setPanel']>[0]) => {
			dispatch({ type: c.app.action.SET_PANEL, panel })
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
			dispatch({ type: c.EDIT_PANEL, panel })
		},
	} as T.App.Context

	React.useEffect(() => {
		ctx.settings.set((draft) => {
			config && (draft.server.config = config)
			panelId && (draft.defaultPanel = c.panel[panelId].value)
		})
	}, [])

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
						if (runServer) {
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
