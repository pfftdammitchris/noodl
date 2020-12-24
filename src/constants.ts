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

export const panelId = {
	INIT: 'select-route',
	RETRIEVE_OBJECTS: 'retrieve-objects',
	RETRIEVE_KEYWORDS: 'retrieve-keywords',
	START_SERVER: 'start-server',
} as const
