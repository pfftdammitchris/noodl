import React from 'react'
import produce from 'immer'
import { WritableDraft } from 'immer/dist/internal'
import { Provider } from './useCtx'
import { Action, Context, State } from './types'
import createAggregator from './api/createAggregator'
import PanelRenderer from './PanelRenderer'

let aggregator: ReturnType<typeof createAggregator> = createAggregator()

const initialState: State = {
	panel: {
		id: 'select-route',
		label: 'Select a route',
		options: ['select-route', 'fetch-objects'],
	},
	panels: {
		'select-route': {
			selectedId: 'fetch-objects',
			highlightedId: 'fetch-objects',
		},
		'fetch-objects': {
			exts: [],
		},
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

	return (
		<Provider value={ctx}>
			<PanelRenderer id={state?.panel.id} />
		</Provider>
	)
}

export default App
