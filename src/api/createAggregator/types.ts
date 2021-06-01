import { LiteralUnion } from 'type-fest'
import { DeviceType, Env } from 'noodl-types'
import yaml from 'yaml'

export type CommonEmitEvents =
	| 'PARSED_APP_CONFIG'
	| 'RETRIEVED_ROOT_BASE_URL'
	| 'RETRIEVED_ROOT_CONFIG'
	| 'RETRIEVED_APP_ENDPOINT'
	| 'RETRIEVED_APP_BASE_URL'
	| 'RETRIEVED_APP_PAGE'
	| 'RETRIEVED_CONFIG_VERSION'

export type Hooks = {
	APP_PAGE_DOES_NOT_EXIST: {
		args: { name: string; error: Error }
	}
	RETRIEVED_APP_CONFIG: {
		args: string
	}
	RETRIEVE_APP_PAGE_FAILED: {
		args: { name: string; error: Error }
	}
	RETRIEVING_APP_CONFIG: {
		args: { url: string }
	}
} & Record<CommonEmitEvents, { args: { name: string; doc: yaml.Document } }>

export interface Options {
	config?: string
	deviceType?: DeviceType
	env?: Env
	version?: LiteralUnion<'latest', string>
}

export type Root = Map<
	LiteralUnion<'Global' | 'BaseCSS' | 'BaseDataModel' | 'BasePage', string>,
	yaml.Node | yaml.Document
>
