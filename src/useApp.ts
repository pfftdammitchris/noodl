import React from 'react'
import { WritableDraft } from 'immer/dist/internal'
import chalk from 'chalk'
import produce from 'immer'
import invert from 'lodash/invert'
import useCliConfig from './hooks/useCliConfig'
import createAggregator from './api/createAggregator'
import { AppAction, AppState, AppContext } from './types'
import * as c from './constants'

let aggregator: ReturnType<typeof createAggregator> = createAggregator()

const initialState: AppState = {
	caption: [],
	panel: {
		id: c.panelId.SELECT_ROUTE,
		label: 'Select a route',
	},
	spinner: false,
}

const reducer = produce(
	(draft: WritableDraft<AppState> = initialState, action: AppAction): void => {
		switch (action.type) {
			case c.app.action.SET_CAPTION:
				return void draft.caption.push(action.caption)
			case c.app.action.SET_PANEL:
				return void Object.keys(action.panel).forEach(
					(key) => (draft.panel[key] = action.panel[key]),
				)
			case c.app.action.SET_SPINNER:
				return void (draft.spinner = action.spinner)
		}
	},
)

function useApp() {
	const [state, dispatch] = React.useReducer(reducer, initialState)
	const cliConfig = useCliConfig()

	const setCaption = React.useCallback((caption: string) => {
		dispatch({ type: c.app.action.SET_CAPTION, caption })
	}, [])

	const setErrorCaption = React.useCallback((err: string | Error) => {
		dispatch({
			type: c.app.action.SET_CAPTION,
			caption:
				err instanceof Error
					? `[${chalk.red(err.name)}]: ${chalk.yellow(err.message)}`
					: err,
		})
	}, [])

	const setPanel = React.useCallback((panel: any) => {
		dispatch({ type: c.app.action.SET_PANEL, panel })
	}, [])

	const toggleSpinner = React.useCallback(
		(type?: false | string) =>
			dispatch({
				type: c.app.action.SET_SPINNER,
				spinner: type === undefined ? 'point' : type === false ? false : type,
			}),
		[],
	)

	const ctx = {
		...state,
		aggregator,
		cliConfig,
		setPanel,
		setCaption,
		setErrorCaption,
		toggleSpinner,
	} as AppContext

	React.useEffect(() => {
		if (cliConfig.defaultPanel && c.panel[cliConfig.defaultPanel]) {
			setPanel(c.panel[cliConfig.defaultPanel])
		}
	}, [])

	return ctx
}

export default useApp
