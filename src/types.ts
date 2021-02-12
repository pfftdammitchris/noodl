import { Pair, Scalar, YAMLMap, YAMLSeq } from 'yaml/types'
import { aggregator as aggregatorEvent, panelId } from './constants'
import useCliConfig from './hooks/useCliConfig'
import createAggregator from './api/createAggregator'
import * as c from './constants'

/* -------------------------------------------------------
	---- CONSTANTS
-------------------------------------------------------- */

export type MetadataGroup = 'documents' | 'images' | 'scripts' | 'videos'

/* -------------------------------------------------------
	---- OTHER
-------------------------------------------------------- */
export interface AnyFn {
	(...args: any[]): any
}

export type Aggregator = ReturnType<typeof createAggregator>

export type AppAction =
	| { type: typeof c.app.action.SET_CAPTION; caption: string }
	| {
			type: typeof c.app.action.SET_PANEL
			panel: { id?: PanelId; label?: string; [key: string]: any }
	  }
	| { type: typeof c.app.action.SET_SPINNER; spinner: false | string }

export interface AppState {
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

export interface AppContext extends AppState {
	aggregator: Aggregator
	cliConfig: ReturnType<typeof useCliConfig>
	setCaption(caption: string): void
	setErrorCaption(caption: string | Error): void
	setPanel(item: {
		id?: string
		label?: string
		value?: string
		highlightedId?: string
	}): void
	toggleSpinner(type?: false | string): void
}

export interface RootConfig {
	apiHost: string
	apiPort: string
	designSuffix?: string
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

export interface AppConfig {
	host?: string
	assetsUrl: string
	baseUrl: string
	languageSuffix: { [lang: string]: string }
	fileSuffix: string
	startPage: string
	preload: string[]
	page: string[]
}

export interface EcosGRPC {
	_credentials: {}
	hostname: string // https://ecostest.aitmed.com
	options_: { format: 'text' }
	methodInfoce: {
		MethodInfo: EcosGRPCMethodInfo
	}
	methodInfore: {
		MethodInfo: EcosGRPCMethodInfo
	}
	methodInfodx: {
		MethodInfo: EcosGRPCMethodInfo
	}
	methodInfocv: {
		MethodInfo: EcosGRPCMethodInfo
	}
	methodInforv: {
		MethodInfo: EcosGRPCMethodInfo
	}
	methodInfocd: {
		MethodInfo: EcosGRPCMethodInfo
	}
	methodInford: {
		MethodInfo: EcosGRPCMethodInfo
	}
}

export interface EcosGRPCMethodInfo {
	name: string | undefined
	a: AnyFn
	b: AnyFn
}

export type PanelId = typeof panelId[keyof typeof panelId]
export type EventId = typeof aggregatorEvent.event[keyof typeof aggregatorEvent.event]

export interface CliConfigObject {
	defaultOption: PanelId | null
	defaultPanel: PanelId | null
	server: {
		config?: string
		dir: string
		host: string
		port: number
		protocol: string
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

export interface IdentifyFn<N = any> {
	(node: N): boolean
}

export interface ObjectResult<T extends { [key: string]: any } = any> {
	json: T | T[]
	yml: string
}

export interface PlainObject {
	[key: string]: any
}

export type YAMLNode = Scalar | Pair | YAMLMap | YAMLSeq
