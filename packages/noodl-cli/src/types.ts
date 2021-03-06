import type { Loader } from 'noodl'
import type { Draft } from 'immer'
import type { Cli } from './cli.js'
import { initialState as initialAppState } from './App.js'
import useConfiguration from './hooks/useConfiguration.js'
// import createAggregator from './api/createAggregator'

export namespace App {
	export interface Context extends State {
		aggregator: Loader
		// aggregator: ReturnType<typeof createAggregator>
		cli: Cli
		configuration: ReturnType<typeof useConfiguration>
		exit: (error?: Error | undefined) => void
		highlight(panelKey: App.PanelKey | ''): void
		log(text: string): void
		logError(text: string | Error): void
		toggleSpinner(type?: false | string): void
		set(fn: (draft: Draft<App.State>) => void): void
		setPanel(panelKey: App.PanelKey | '', props?: Record<string, any>): void
	}

	export type PanelKey = string

	export type State = typeof initialAppState
}

export type PanelType = 'main' | 'generate' | 'retrieve' | 'server'

export interface PanelObject<Key extends string = string> {
	key?: Key
	value: Key
	label: string
	[key: string]: any
}
