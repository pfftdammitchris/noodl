import { Pair, Scalar, YAMLMap, YAMLSeq } from 'yaml'
import useCliConfig from './hooks/useCliConfig'
import createAggregator from './api/createAggregator'
import * as c from './constants'

export namespace App {
	export type Action =
		| { type: typeof c.UPDATE_PANEL; panel: Partial<State['panel']> }
		| { type: typeof c.app.action.HIGHLIGHT_PANEL; panelId: PanelId }
		| { type: typeof c.app.action.SET_CAPTION; caption: string }
		| { type: typeof c.app.action.SET_SPINNER; spinner: false | string }

	export interface State {
		caption: string[]
		panel: {
			value: PanelId | ''
			highlightedId: PanelId | ''
			mounted: boolean
			idle: boolean
		}
		spinner: false | string
	}

	export interface Context extends State {
		aggregator: ReturnType<typeof createAggregator>
		cliArgs: {
			config?: string
			defaultPanel?: App.PanelId
			ext?: 'json' | 'yml'
			runServer?: boolean
		}
		highlightPanel(id: App.PanelId): void
		settings: ReturnType<typeof useCliConfig>
		setCaption(caption: string): void
		setErrorCaption(caption: string | Error): void
		toggleSpinner(type?: false | string): void
		updatePanel(panel: Partial<State['panel']>): void
	}

	export interface CliConfigObject {
		defaultOption: App.PanelId | null
		defaultPanel: App.PanelId | null
		server: {
			config?: string
			dir: string
			host: string
			port: number
			protocol: string
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

	export type EventId = typeof c.aggregator.event[keyof typeof c.aggregator.event]

	export type PanelId = keyof typeof c.panel

	export type PanelObject = typeof c.panel[PanelId]
}

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

export namespace Noodl {
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
}

export interface IdentifyFn<N = any> {
	(node: N): boolean
}

export interface PlainObject {
	[key: string]: any
}

export type YAMLNode = Scalar | Pair | YAMLMap | YAMLSeq
