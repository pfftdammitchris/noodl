import * as C from './constants'

export interface IBaseObjects {
	baseUrl: string
	appEndpoint: string
	appBaseUrl: string
	version: string
	rootConfig: RootConfig | null
	appConfig: AppConfig | null
	init(): Promise<{ [name: string]: any }>
	onRootConfig?(config: ObjectResult<RootConfig>): void
	onAppConfig?<Config extends {} = any>(config: ObjectResult<Config>): void
	onVersion?(version: string): void
	onBaseUrl?(baseUrl: string): void
	onAppEndpoint?(endpoint: string): void
	onAppBaseUrl?(baseUrl: string): void
	on(
		eventName: 'root.config',
		cb: (config: ObjectResult<RootConfig>) => any,
	): this
	on(
		eventName: 'app.config',
		cb: (config: ObjectResult<AppConfig>) => any,
	): this
	on(eventName: 'version', cb: (version: string) => any): this
	on(eventName: 'base.url', cb: (baseUrl: string) => any): this
	on(eventName: 'app.endpoint', cb: (appEndpoint: string) => any): this
	on(eventName: 'app.base.url', cb: (appBaseUrl: string) => any): this
	on(eventName: IBaseObjectsEvent, cb: (...args: any[]) => any): this
	off(eventName: IBaseObjectsEvent, cb: Function): this
	emit(eventName: IBaseObjectsEvent, ...args: any[]): this
}

export interface IAppObjects {
	assetsUrl: string
	baseUrl: string
	config: AppConfig
	locale: string
	init(): Promise<{ [pageName: string]: any }>
	onStart?(): void
	onObject?<Obj = any>(obj: ObjectResult<Obj>): void
	onEnd?(): void
}

export type IBaseObjectsEvent =
	| 'root.config'
	| 'app.config'
	| 'version'
	| 'base.url'
	| 'app.endpoint'
	| 'app.base.url'

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

export interface ObjectResult<T = any> {
	json: T
	yml?: string
}

export type ScriptId =
	| typeof C.RETRIEVE_NOODL_OBJECTS_JSON
	| typeof C.RETRIEVE_NOODL_OBJECTS_YML
	| typeof C.RETRIEVE_NOODL_OBJECTS_WITH_KEYS
	| typeof C.RETRIEVE_NOODL_PROPERTIES

export type PanelType = 'input' | 'select' | 'select-multiple'
export interface PanelConfig {
	label: string
	value: string
	type: PanelType
}

export interface PanelOption {
	name: string
	onSelect(item: any): void
}
