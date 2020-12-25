import { panelId } from './constants'
import createAggregator from './api/createAggregator'

export type Aggregator = ReturnType<typeof createAggregator>

export type PanelId = typeof panelId[keyof typeof panelId]

export interface Context extends State {
	aggregator: Aggregator
	mergeToPanel(item: {
		id?: string
		label?: string
		value?: string
		highlightedId?: string
	}): void
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

export interface CLIConfigObject {
	server: {
		dir: string | string[]
	}
	objects: {
		json: {
			dir: string | string[]
		}
		yml: {
			dir: string | string[]
		}
	}
}

export interface State {
	cliConfig: {
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
	web?: {
		cadlVersion: { stable: number; test: number }
	}
	ios?: {
		cadlVersion: { stable: number; test: number }
	}
	android?: {
		cadlVersion: { stable: number; test: number }
	}
	cadlBaseUrl: string
	cadlMain?: string
	timestamp?: number
}

export interface ObjectResult<T extends { [key: string]: any } = any> {
	json: T
	yml: { [key: string]: string }
}
