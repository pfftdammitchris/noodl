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
	getConsumerConfig(): CLIConfigObject | undefined
	setCaption(caption: string): void
	setErrorCaption(caption: string | Error): void
	setPanel(item: {
		id?: string
		label?: string
		value?: string
		highlightedId?: string
	}): void
	server: ServerOptions
	toggleSpinner(type?: false | string): void
}

export interface CLIConfigObject {
	initialOption?: string
	server: ServerOptions
	objects: {
		hostname: string
		json: {
			dir: string | string[]
		}
		yml: {
			dir: string | string[]
		}
	}
}

export interface ServerOptions {
	dir: string
	port: number
	host: string
	protocol: string
}

export interface AppConfig {
	host: string
	assetsUrl: string
	baseUrl: string
	languageSuffix: { [lang: string]: string }
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
	versionNumber?: number
	viewWidthHeightRatio?: {
		min: number
		max: number
	}
	debug?: string
	web?: {
		cadlVersion: { stable: string; test: string }
	}
	ios?: {
		cadlVersion: { stable: string; test: string }
	}
	android?: {
		cadlVersion: { stable: string; test: string }
	}
	cadlBaseUrl: string
	cadlMain?: string
	myBaseUrl?: string
	bodyTopPplugin?: string
	bodyTailPplugin?: string
	headPlugin?: string
	timestamp?: number
	keywords?: string[]
}

export interface ObjectResult<T extends { [key: string]: any } = any> {
	json: T | T[]
	yml: string
}

export interface PlainObject {
	[key: string]: any
}

export type YAMLNode = Scalar | Pair | YAMLMap | YAMLSeq
