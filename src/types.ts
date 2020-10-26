import * as C from './constants'

export type ScriptId =
	| typeof C.RETRIEVE_NOODL_OBJECTS_JSON
	| typeof C.RETRIEVE_NOODL_OBJECTS_YML
	| typeof C.RETRIEVE_NOODL_OBJECTS_WITH_KEYS
	| typeof C.RETRIEVE_NOODL_PROPERTIES
