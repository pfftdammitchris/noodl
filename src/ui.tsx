import React from 'react'
import chalk from 'chalk'
import produce from 'immer'
import { Newline, Static, Text } from 'ink'
import { WritableDraft } from 'immer/dist/internal'
import { Provider } from './useCtx'
import { panelId } from './constants'
import { Action, Context, PanelId, State } from './types/types'
import createAggregator from './api/createAggregator'
import Settings from './panels/Settings'
import SelectRoute from './panels/SelectRoute'
import StartServer from './panels/StartServer'
import RetrieveObjects from './panels/RetrieveObjects'
import RetrieveKeywords from './panels/RetrieveKeywords'

const panels = {
	[panelId.SELECT_ROUTE]: SelectRoute,
	[panelId.RETRIEVE_OBJECTS]: RetrieveObjects,
	[panelId.RETRIEVE_KEYWORDS]: RetrieveKeywords,
	[panelId.START_SERVER]: StartServer,
}

let aggregator: ReturnType<typeof createAggregator> = createAggregator()

const initialState: State = {
	caption: [],
	server: { url: '', dir: '', port: null },
	objects: {
		json: { dir: [] },
		yml: { dir: [] },
	},
	panel: {
		id: panelId.SELECT_ROUTE,
		label: 'Select a route',
	},
}

const reducer = produce(
	(draft: WritableDraft<State> = initialState, action: Action): void => {
		switch (action.type) {
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
		}
	},
)

function App() {
	const [state, dispatch] = React.useReducer(reducer, initialState)

	const ctx: Context = {
		...state,
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
	} as Context

	const Panel = panels[state?.panel.id as PanelId]

	return (
		<Provider value={ctx}>
			<Newline />
			<Settings />
			<Panel />
			<Static items={state?.caption as string[]}>
				{(caption) => <Text key={caption}>{caption}</Text>}
			</Static>
		</Provider>
	)
}

export default App
