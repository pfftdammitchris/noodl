import { LiteralUnion } from 'type-fest'
import { Pair, Scalar, YAMLMap, YAMLSeq } from 'yaml'
import { Draft } from 'immer'
import { Cli } from './cli'
import { initialState as initialAppState } from './App'
import { AppPanel } from './App'
import createAggregator from './api/createAggregator'
import CliConfig from './builders/CLIConfig'

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
		cliConfig: CliConfig
		exit: (error?: Error | undefined) => void
		highlight(panelKey: App.PanelKey | ''): void
		log(text: string): void
		logError(text: string | Error): void
		toggleSpinner(type?: false | string): void
		set(fn: (draft: Draft<App.State>) => void): void
		setPanel(panelKey: App.PanelKey | '', props?: Record<string, any>): void
	}

	export type PanelKey = LiteralUnion<keyof typeof AppPanel, string>

	export type State = typeof initialAppState
}

export type PanelType = 'main' | 'generate' | 'retrieve' | 'server'

export interface PanelObject<Key extends string = string> {
	key?: Key
	value: Key
	label: string
	[key: string]: any
}

/* -------------------------------------------------------
	---- CONSTANTS
-------------------------------------------------------- */

export type MetadataGroup =
	| 'documents'
	| 'images'
	| 'page'
	| 'scripts'
	| 'videos'

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

export type YAMLNode =
	| Scalar<any>
	| Pair<any, any>
	| YAMLMap<any, any>
	| YAMLSeq<any>
