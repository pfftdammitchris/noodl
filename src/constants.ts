export const DEFAULT_BASE_URL = 'https://public.aitmed.com'
export const DEFAULT_CONFIG = 'aitmed'

export const eventId = {
	RETRIEVED_ROOT_CONFIG: 'retrieved.root.config',
	RETRIEVED_APP_CONFIG: 'retrieved.app.config',
	RETRIEVED_VERSION: 'retrieved.root.config.version',
	RETRIEVED_ROOT_BASE_URL: 'retrieved.root.config.base.url',
	RETRIEVED_APP_ENDPOINT: 'retrieved.app.endpoint',
	RETRIEVED_APP_BASE_URL: 'retrieved.app.base.url',
}

export const RETRIEVE_NOODL_OBJECTS_JSON = 'RETRIEVE_NOODL_OBJECTS_JSON'
export const RETRIEVE_NOODL_OBJECTS_YML = 'RETRIEVE_NOODL_OBJECTS_YML'
export const RETRIEVE_NOODL_PROPERTIES = 'RETRIEVE_NOODL_PROPERTIES'
export const RETRIEVE_NOODL_OBJECTS_WITH_KEYS =
	'RETRIEVE_NOODL_OBJECTS_WITH_KEYS'

export const retrieveObjectsPanels = {
	RETRIEVE_OBJECTS: 'retrieve-objects',
	RETRIEVED_OBJECTS: 'retrieved-objects',
	SAVE_RETRIEVED_OBJECTS: 'save-retrieved-objects',
}

export const panel = {
	INIT: 'init',
	RETRIEVE_KEYWORDS: 'retrieve-keywords',
	...retrieveObjectsPanels,
}
