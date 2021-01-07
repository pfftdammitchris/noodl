import React from 'react'
import chalk from 'chalk'
import fs from 'fs-extra'
import produce from 'immer'
import Spinner from 'ink-spinner'
import { Newline, Static, Text } from 'ink'
import { WritableDraft } from 'immer/dist/internal'
import { Provider } from './useCtx'
import { panelId } from './constants'
import { Action, Context, PanelId, State } from './types'
import createAggregator from './api/createAggregator'
import Settings from './panels/Settings'
import SelectRoute from './panels/SelectRoute'
import StartServer from './panels/StartServer'
import RetrieveObjects from './panels/RetrieveObjects'
import RetrieveKeywords from './panels/RetrieveKeywords'
import HighlightedText from './components/HighlightedText'

const panels = {
	[panelId.SELECT_ROUTE]: SelectRoute,
	[panelId.RETRIEVE_OBJECTS]: RetrieveObjects,
	[panelId.RETRIEVE_KEYWORDS]: RetrieveKeywords,
	[panelId.START_SERVER]: StartServer,
}

let aggregator: ReturnType<typeof createAggregator> = createAggregator()

const initialState: State = {
	ownConfig: null,
	caption: [],
	server: { host: '', dir: '', port: null },
	objects: {
		json: { dir: [] },
		yml: { dir: [] },
	},
	panel: {
		id: panelId.SELECT_ROUTE,
		label: 'Select a route',
	},
	spinner: false,
}

const reducer = produce(
	(draft: WritableDraft<State> = initialState, action: Action): void => {
		switch (action.type) {
			case 'set-own-config':
				return void (draft.ownConfig = action.value)
			case 'set-caption':
				return void draft.caption.push(action.caption)
			case 'set-server-options':
				return void Object.assign(draft.server, action.options)
			case 'set-objects-json-options':
				return void Object.assign(draft.objects.json, action.options)
			case 'set-objects-yml-options':
				return void Object.assign(draft.objects.yml, action.options)
			case 'set-panel':
				return void Object.keys(action.panel).forEach(
					(key) => (draft.panel[key] = action.panel[key]),
				)
			case 'set-spinner':
				return void (draft.spinner = action.spinner)
		}
	},
)

function App() {
	const [state, dispatch] = React.useReducer(reducer, initialState)

	const ctx: Context = {
		...state,
		aggregator,
		aggregator,
		setPanel: React.useCallback((panel: any) => {
			dispatch({ type: 'set-panel', panel })
		}, []),
		setCaption: React.useCallback((caption: string) => {
			dispatch({ type: 'set-caption', caption })
		}, []),
		setErrorCaption: React.useCallback((err: string | Error) => {
			dispatch({
				type: 'set-caption',
				caption:
					err instanceof Error
						? `[${chalk.red(err.name)}]: ${chalk.yellow(err.message)}`
						: err,
			})
		}, []),
		setServerOptions: React.useCallback((options: Partial<State['server']>) => {
			const changes = {} as any
			Object.entries(options).forEach(([key, value]) => {
				changes[key] = value
			})
			dispatch({ type: 'set-server-options', options: changes })
		}, []),
		setObjectsJsonOptions: React.useCallback(
			(options: Partial<State['objects']['json']>) => {
				const changes = {} as any
				Object.entries(options).forEach(([key, value]) => {
					changes[key] = value
				})
				dispatch({ type: 'set-objects-json-options', options: changes })
			},
			[],
		),
		setObjectsYmlOptions: React.useCallback(
			(options: Partial<State['objects']['yml']>) => {
				const changes = {} as any
				Object.entries(options).forEach(([key, value]) => {
					changes[key] = value
				})
				dispatch({ type: 'set-objects-yml-options', options: changes })
			},
			[],
		),
		toggleSpinner: React.useCallback(
			(type?: false | string) =>
				dispatch({
					type: 'set-spinner',
					spinner: type === undefined ? 'point' : type === false ? false : type,
				}),
			[],
		),
	} as Context

	const Panel = panels[state?.panel.id as PanelId]

	// Initiates the app's cli presence state
	React.useEffect(() => {
		dispatch({ type: 'set-own-config', value: fs.existsSync('noodl.json') })
	}, [])

	return (
		<Provider value={ctx}>
			<Newline />
			<Settings />
			{state?.spinner ? (
				<HighlightedText color="whiteBright">
					<Spinner type={state.spinner as any} />
				</HighlightedText>
			) : null}
			<Panel />
			<Static items={state?.caption as string[]}>
				{(caption) => <Text key={caption}>{caption}</Text>}
			</Static>
		</Provider>
	)
}

export default App
