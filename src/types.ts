import { Pair, Scalar, YAMLMap, YAMLSeq } from 'yaml'
import { Draft } from 'immer'
import { Cli } from './cli'
import { initialState as initialAppState } from './App'
import { AppPanel } from './App'
import createAggregator from './api/createAggregator'
import CliConfig from './builders/CLIConfig'
import * as c from './constants'

export namespace App {
	export interface Context extends State {
		aggregator: ReturnType<typeof createAggregator>
		cli: Cli
		cliConfig: CliConfig
		exit: (error?: Error | undefined) => void
		highlight(id: string): void
		log(caption: string): void
		logError(caption: string | Error): void
		toggleSpinner(type?: false | string): void
		set(fn: (draft: Draft<App.State>) => void): void
		setPanel(id: string, params?: Record<string, any>): void
		update<Key extends string>(id: Key, panel: Partial<PanelObject<Key>>): void
	}

	export type PanelKey = keyof typeof AppPanel

	export type State = typeof initialAppState
}

export type PanelType = 'main' | 'generate' | 'retrieve' | 'server'

export interface PanelObject<Key extends string = string> {
	key?: Key
	value: Key
	label: string
	[key: string]: any
}

export interface CliConfigObject {
	defaultOption: App.PanelKey | null
	defaultPanel: App.PanelKey | null
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
	scripts?: {
		aggregator?: {
			dataFiles?: string
			outFile?: string
			use?: string[]
		}
	}
}

export type EventId = typeof c.aggregator.event[keyof typeof c.aggregator.event]

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

export type YAMLNode =
	| Scalar<any>
	| Pair<any, any>
	| YAMLMap<any, any>
	| YAMLSeq<any>
