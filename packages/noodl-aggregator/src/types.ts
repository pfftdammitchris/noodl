import { LiteralUnion } from 'type-fest'
import { OrArray } from '@jsmanifest/typefest'
import { DeviceType, Env } from 'noodl-types'
import yaml from 'yaml'

export type CommonEmitEvents =
	| 'PARSED_APP_CONFIG'
	| 'RETRIEVED_ROOT_BASE_URL'
	| 'ON_RETRIEVED_ROOT_CONFIG'
	| 'RETRIEVED_APP_ENDPOINT'
	| 'RETRIEVED_APP_BASE_URL'
	| 'ON_RETRIEVED_APP_PAGE'
	| 'RETRIEVED_CONFIG_VERSION'

export type Hooks = {
	ON_APP_PAGE_DOESNT_EXIST: { args: { name: string; error: Error } }
	ON_CONFIG_KEY: { args: string }
	ON_CONFIG_VERSION: { args: string }
	ON_PLACEHOLDER_PURGED: { args: { before: string; after: string } }
	ON_RETRIEVING_APP_CONFIG: { args: { url: string } }
	ON_RETRIEVED_APP_CONFIG: { args: string }
	ON_RETRIEVE_APP_PAGE_FAILED: { args: { name: string; error: Error } }
	ON_RETRIEVING_ROOT_CONFIG: { args: { url: string } }
	ON_RETRIEVED_ROOT_CONFIG: {
		args: { doc: yaml.Document; name: string; yml: string }
	}
} & Record<CommonEmitEvents, { args: { name: string; doc: yaml.Document } }>

export type LoadOptions<Type extends 'doc' | 'yml' = 'doc' | 'yml'> =
	| string
	| (Type extends 'doc'
			? OrArray<{ name: string; doc: yaml.Document }>
			: OrArray<{ name: string; yml: string }>)

export interface Options {
	config?: string
	deviceType?: DeviceType
	env?: Env
	version?: LiteralUnion<'latest', string>
}

export type Root = Map<
	LiteralUnion<'Global' | 'BaseCSS' | 'BaseDataModel' | 'BasePage', string>,
	yaml.Node | yaml.Document
> & { toJSON(): Record<string, any> }
