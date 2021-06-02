import ConfigStore from 'configstore'
import { Draft } from 'immer'
import { Cli } from './cli'
import { initialState as initialAppState } from './App'
import createAggregator from './api/createAggregator'

export namespace App {
	export interface Config {
		paths?: {
			json: string
			yml: string
		}
		panels: { component: string; label: string; value: string }[]
	}
	export interface Context extends State {
		aggregator: ReturnType<typeof createAggregator>
		config: Config
		cli: Cli
		exit: (error?: Error | undefined) => void
		highlight(panelKey: App.PanelKey | ''): void
		log(text: string): void
		logError(text: string | Error): void
		toggleSpinner(type?: false | string): void
		set(fn: (draft: Draft<App.State>) => void): void
		setPanel(panelKey: App.PanelKey | '', props?: Record<string, any>): void
		settings: Settings
	}

	export type PanelKey = string

	export type State = typeof initialAppState

	export type Settings = ConfigStore

	export interface SettingsObject {
		serverDir?: string
	}
}

export type PanelType = 'main' | 'generate' | 'retrieve' | 'server'

export interface PanelObject<Key extends string = string> {
	key?: Key
	value: Key
	label: string
	[key: string]: any
}

export type MetadataGroup =
	| 'config'
	| 'document'
	| 'image'
	| 'page'
	| 'script'
	| 'video'

export interface MetadataBaseObject {
	ext: string
	filename: string
	group: MetadataGroup
}

export interface MetadataFileObject extends MetadataBaseObject {
	filepath: string
}

export interface MetadataLinkObject extends MetadataBaseObject {
	name: string
	url: string
}
