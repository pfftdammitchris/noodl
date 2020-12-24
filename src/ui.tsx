import React from 'react'
import merge from 'lodash/merge'
import produce from 'immer'
import fs from 'fs-extra'
import { WritableDraft } from 'immer/dist/internal'
import { Provider } from './useCtx'
import { panelId } from './constants'
import { Action, Context, PanelId, State } from './types'
import { getFilePath } from './utils/common'
import createAggregator from './api/createAggregator'
import RetrieveObjects from './panels/RetrieveObjects'
import SelectRoute from './panels/SelectRoute'
import StartServer from './panels/StartServer'

const panels = {
	[panelId.INIT]: SelectRoute,
	[panelId.RETRIEVE_OBJECTS]: RetrieveObjects,
	[panelId.RETRIEVE_KEYWORDS]: null as any,
	[panelId.START_SERVER]: StartServer,
}

let aggregator: ReturnType<typeof createAggregator> = createAggregator()

const initialState: State = {
	cliConfig: {
		server: {},
		json: {},
		yml: {},
	},
	panel: {
		id: panelId.INIT,
		label: 'Select a route',
	},
}

const reducer = produce(
	(draft: WritableDraft<State> = initialState, action: Action): void => {
		switch (action.type) {
			case 'merge-to-panel':
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
		mergeToPanel: React.useCallback((panel: any) => {
			dispatch({ type: 'merge-to-panel', panel })
		}, []),
	} as Context

	const Panel = panels[state?.panel.id as PanelId]

	React.useEffect(() => {
		const getDefaultCliConfig = () => ({
			server: {
				path: getFilePath('./server'),
			},
			json: {
				path: getFilePath('./data/objects/json'),
			},
			yml: {
				path: getFilePath('./data/objects/yml'),
			},
		})
		if (fs.existsSync(getFilePath('./noodlrc.json'))) {
			const cliConfig = fs.readJsonSync('./noodlrc.json') as State['cliConfig']
			dispatch({
				type: 'set-cli-config',
				config: merge(getDefaultCliConfig(), cliConfig),
			})
		} else {
			// Set default CLI config
			dispatch({
				type: 'set-cli-config',
				config: getDefaultCliConfig(),
			})
		}
	}, [])

	return (
		<Provider value={ctx}>
			<Panel />
		</Provider>
	)
}

export default App
