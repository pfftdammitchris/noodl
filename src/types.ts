import * as C from './constants'

export interface IBaseObjects {
	baseUrl: string
	appEndpoint: string
	appBaseUrl: string
	version: string
	rootConfig: RootConfig | null
	appConfig: AppConfig | null
	onRootConfig?(config: { json: RootConfig; yml?: string }): void
	onAppConfig?<Config extends {} = any>(config: {
		json: Config
		yml?: string
	}): void
	onVersion?(version: string): void
	onBaseUrl?(baseUrl: string): void
	onAppEndpoint?(endpoint: string): void
	onAppBaseUrl?(baseUrl: string): void
}

type ConsoleLog = typeof console.log

export interface Log extends ConsoleLog {
	attention(s?: string): Log
	blank(): Log
}

export type ParseModeModifier = 'default' | 'ui'
export type ParseMode = 'json' | 'yml'

export interface AppConfig {}

export interface AppConfig {
	baseUrl: string
	assetsUrl: string
	languageSuffix: string
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

export type ScriptId =
	| typeof C.RETRIEVE_NOODL_OBJECTS_JSON
	| typeof C.RETRIEVE_NOODL_OBJECTS_YML
	| typeof C.RETRIEVE_NOODL_OBJECTS_WITH_KEYS
	| typeof C.RETRIEVE_NOODL_PROPERTIES
