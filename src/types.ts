import * as C from './constants'

type ConsoleLog = typeof console.log

export interface Log extends ConsoleLog {
	attention(s?: string): Log
	blank(): Log
}

export type ParseModeModifier = 'default' | 'ui'
export type ParseMode = 'json' | 'yml'

export type ScriptId =
	| typeof C.RETRIEVE_NOODL_OBJECTS_JSON
	| typeof C.RETRIEVE_NOODL_OBJECTS_YML
	| typeof C.RETRIEVE_NOODL_OBJECTS_WITH_KEYS
	| typeof C.RETRIEVE_NOODL_PROPERTIES
