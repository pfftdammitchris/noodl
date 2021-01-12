import { Pair, Scalar, YAMLMap, YAMLSeq } from 'yaml/types'
import { aggregator as aggregatorEvent, panelId } from '../constants'
import { State } from '../useApp'
import createAggregator from '../api/createAggregator'

export interface AnyFn {
	(...args: any[]): any
}

export type Aggregator = ReturnType<typeof createAggregator>

export type PanelId = typeof panelId[keyof typeof panelId]
export type EventId = typeof aggregatorEvent.event[keyof typeof aggregatorEvent.event]

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
	toggleSpinner(type?: false | string): void
}

export interface CLIConfigContext extends CLIConfigObject {
	url: string
}

export interface ConsumerCLIConfigObject {
	server: {
		host: string
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
		host: string
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
	host: string
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
	json: T | T[]
	yml: string
}

export interface PlainObject {
	[key: string]: any
}

export type YAMLNode = Scalar | Pair | YAMLMap | YAMLSeq
