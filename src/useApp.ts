import React from 'react'
import fs from 'fs-extra'
import chalk from 'chalk'
import produce from 'immer'
import { WritableDraft } from 'immer/dist/internal'
import * as c from './constants'
import { CLIConfigObject, Context, PanelId } from './types'
import createAggregator from './api/createAggregator'
import { getFilePath } from './utils/common'

export type Action =
	| { type: typeof c.app.action.SET_CAPTION; caption: string }
	| {
			type: typeof c.app.action.SET_PANEL
			panel: { id?: PanelId; label?: string; [key: string]: any }
	  }
	| { type: typeof c.app.action.SET_SPINNER; spinner: false | string }

export interface State {
	caption: string[]
	panel: {
		id: PanelId
		label: string
		value?: string
		highlightedId?: string
		[key: string]: any
	}
	spinner?: false | string
}

let aggregator: ReturnType<typeof createAggregator> = createAggregator()

const initialState: State = {
	caption: [],
	panel: {
		id: c.panelId.SELECT_ROUTE,
		label: 'Select a route',
	},
	spinner: false,
}

const reducer = produce(
	(draft: WritableDraft<State> = initialState, action: Action): void => {
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

	const getConsumerConfig = React.useCallback(():
		| CLIConfigObject
		| undefined => {
		const configPath = getFilePath(c.DEFAULT_CONFIG_FILEPATH)
		let configObj: any
		try {
			configObj = fs.readJsonSync(configPath)
		} catch (error) {
			setErrorCaption(error)
		}
		return configObj
	}, [])

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

	const ctx: Context = {
		...(state as State),
		aggregator,
		getConsumerConfig,
		setPanel,
		setCaption,
		setErrorCaption,
		toggleSpinner,
	}

	return ctx
}

export default useApp
