import { ListedItem } from 'ink-multi-select'
import { panelId } from './constants'
import createAggregator from './api/createAggregator'

export type Aggregator = ReturnType<typeof createAggregator>

export type PanelId = typeof panelId[keyof typeof panelId]

export interface Context extends State {
	aggregator: Aggregator
	mergeToPanel(item: { label: string; value: any }): void
}

export type Action =
	| { type: 'set-cli-config'; config: State['cliConfig'] }
	| {
			type: 'merge-to-panel'
			panel: {
				id?: PanelId
				label?: string
				[key: string]: any
			}
	  }

export interface State {
	cliConfig: {
		server?: {
			path?: string
		}
		json?: {
			path?: string
		}
		yml?: {
			path?: string
		}
	}
	panel: {
		id: PanelId
		label: string
		[key: string]: any
	}
}

export type ConsoleLog = typeof console.log

export interface Log extends ConsoleLog {
	attention(s?: string): Log
	blank(): Log
}

export type ParseModeModifier = 'default' | 'ui'
export type ParseMode = 'json' | 'yml'

export interface AppConfig {
	baseUrl: string
	assetsUrl: string
	languageSuffix: string | { [lang: string]: string }
	fileSuffix: string
	startPage: string
	preload: string[]
	page: string[]
}

export interface RootConfig {
	apiHost: string
	apiPort: string
	webApiHost: string
	appApiHost: string
	connectiontimeout: string
	loadingLevel: number
	versionNumber: number
	debug: string
	web: {
		cadlVersion: { stable: number; test: number }
	}
	ios: {
		cadlVersion: { stable: number; test: number }
	}
	android: {
		cadlVersion: { stable: number; test: number }
	}
	cadlBaseUrl: string
	cadlMain: string
	timestamp: number
}

export interface ObjectResult<T extends { [key: string]: any } = any> {
	json: T
	yml: { [key: string]: string }
}

export type PanelType = 'check' | 'input' | 'select' | 'select-multiple'

export type PanelConfig =
	| PanelCheckConfig
	| PanelInputConfig
	| PanelSelectConfig
	| PanelSelectMultipleConfig

export interface PanelBaseConfig<S extends string = any> {
	value: string
	label: string
	type: S
}

export interface PanelCheckConfig extends PanelBaseConfig {
	type: 'check'
}

export interface PanelInputConfig extends PanelBaseConfig {
	type: 'input'
	placeholder?: string
}

export interface PanelSelectConfig extends PanelBaseConfig {
	type: 'select'
	items: PanelConfig[]
}

export interface PanelSelectMultipleConfig extends PanelBaseConfig {
	type: 'select-multiple'
	label?: string
	selected: ListedItem[]
	options: (string | ListedItem)[]
}
