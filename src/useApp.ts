import React from 'react'
import chalk from 'chalk'
import fs from 'fs-extra'
import produce from 'immer'
import { WritableDraft } from 'immer/dist/internal'
import { app as c, DEFAULT_CONFIG_FILEPATH, panelId } from './constants'
import { Context, PanelId } from './types'
import { getFilePath } from './utils/common'
import createAggregator from './api/createAggregator'

export type Action =
	| { type: typeof c.action.SET_OWN_CONFIG; value: boolean | null }
	| { type: typeof c.action.SET_CAPTION; caption: string }
	| {
			type: typeof c.action.SET_PANEL
			panel: { id?: PanelId; label?: string; [key: string]: any }
	  }
	| { type: typeof c.action.SET_SPINNER; spinner: false | string }

export interface State {
	ownConfig: boolean | null
	caption: string[]
	panel: {
		id: PanelId
		label: string
		[key: string]: any
	}
	spinner?: false | string
}

let aggregator: ReturnType<typeof createAggregator> = createAggregator()

const initialState: State = {
	ownConfig: null,
	caption: [],
	panel: {
		id: panelId.SELECT_ROUTE,
		label: 'Select a route',
	},
	spinner: false,
}

const reducer = produce(
	(draft: WritableDraft<State> = initialState, action: Action): void => {
		switch (action.type) {
			case c.action.SET_OWN_CONFIG:
				return void (draft.ownConfig = action.value)
			case c.action.SET_CAPTION:
				return void draft.caption.push(action.caption)
			case c.action.SET_PANEL:
				return void Object.keys(action.panel).forEach(
					(key) => (draft.panel[key] = action.panel[key]),
				)
			case c.action.SET_SPINNER:
				return void (draft.spinner = action.spinner)
		}
	},
)

function useApp() {
	const [state, dispatch] = React.useReducer(reducer, initialState)

	const setCaption = React.useCallback((caption: string) => {
		dispatch({ type: c.action.SET_CAPTION, caption })
	}, [])

	const setErrorCaption = React.useCallback((err: string | Error) => {
		dispatch({
			type: c.action.SET_CAPTION,
			caption:
				err instanceof Error
					? `[${chalk.red(err.name)}]: ${chalk.yellow(err.message)}`
					: err,
		})
	}, [])

	const setPanel = React.useCallback((panel: any) => {
		dispatch({ type: c.action.SET_PANEL, panel })
	}, [])

	const toggleSpinner = React.useCallback(
		(type?: false | string) =>
			dispatch({
				type: c.action.SET_SPINNER,
				spinner: type === undefined ? 'point' : type === false ? false : type,
			}),
		[],
	)

	// Initiates the app's cli presence state
	React.useEffect(() => {
		dispatch({
			type: c.action.SET_OWN_CONFIG,
			value: fs.existsSync(getFilePath(DEFAULT_CONFIG_FILEPATH)),
		})
	}, [])

	const ctx: Context = {
		...(state as State),
		aggregator,
		setPanel,
		setCaption,
		setErrorCaption,
		toggleSpinner,
	}

	return ctx
}

export default useApp
