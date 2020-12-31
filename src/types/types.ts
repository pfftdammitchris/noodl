import { panelId } from '../constants'
import createAggregator from '../api/createAggregator'

export type Aggregator = ReturnType<typeof createAggregator>

export type PanelId = typeof panelId[keyof typeof panelId]

export interface Context extends State {
	aggregator: Aggregator
	setCaption(caption: string): void
	setErrorCaption(caption: string | Error): void
	setServerOptions(options: Partial<State['server']>): void
	setObjectsJsonOptions(options: Partial<State['objects']['json']>): void
	setObjectsYmlOptions(options: Partial<State['objects']['yml']>): void
	setPanel(item: {
		id?: string
		label?: string
		value?: string
		highlightedId?: string
	}): void
}

export interface CLIConfigContext extends CLIConfigObject {
	url: string
}

export type Action =
	| { type: 'set-caption'; caption: string }
	| { type: 'set-server-options'; options: Partial<State['server']> }
	| {
			type: 'set-objects-json-options'
			options: Partial<State['objects']['json']>
	  }
	| {
			type: 'set-objects-yml-options'
			options: Partial<State['objects']['yml']>
	  }
	| {
			type: 'set-panel'
			panel: {
				id?: PanelId
				label?: string
				[key: string]: any
			}
	  }

export interface State {
	caption: string[]
	server: {
		url: string
		dir: string
		port: null | number
	}
	objects: {
		json: {
			dir: string[]
		}
		yml: {
			dir: string[]
		}
	}
	panel: {
		id: PanelId
		label: string
		[key: string]: any
	}
}

export interface ConsumerCLIConfigObject {
	server: {
		baseUrl: string
		dir: string
		port: number
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

export interface CLIConfigObject {
	server: {
		baseUrl: string
		dir: string
		port: number
	}
	objects: {
		json: {
			dir: string[]
		}
		yml: {
			dir: string[]
		}
	}
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
