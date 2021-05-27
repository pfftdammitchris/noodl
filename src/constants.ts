export const DEFAULT_CONFIG_HOSTNAME = 'public.aitmed.com'
export const DEFAULT_CONFIG = 'aitmed'
export const DEFAULT_SERVER_HOSTNAME = '127.0.0.1'
export const DEFAULT_SERVER_PATH = 'server'
export const DEFAULT_SERVER_PORT = 3000
export const DEFAULT_SERVER_PROTOCOL = 'http'

export const app = {
	INITIAL_OPTION: 'retrieve.objects',
	action: {
		HIGHLIGHT_PANEL: 'HIGHLIGHT_PANEL',
		SET_CAPTION: 'set.caption',
		SET_SERVER_OPTIONS: 'set.server.options',
		SET_OBJECTS_JSON_OPTIONS: 'set.objects.json.options',
		SET_OBJECTS_YML_OPTIONS: 'set.obects.yml.options',
		SET_PANEL: 'set.panel',
		SET_SPINNER: 'set.spinner',
	},
	panel: {
		FETCH_OBJECTS: 'fetchObjects',
		FETCH_SERVER_FILES: 'fetchServerFiles',
		RUN_SERVER: 'runServer',
		NOODL_WEBPACK_PLUGIN: 'noodlWebpackPlugin',
	},
} as const

export const aggregator = {
	event: {
		RETRIEVED_ROOT_CONFIG: 'retrieved.root.config',
		RETRIEVED_APP_CONFIG: 'retrieved.app.config',
		RETRIEVED_VERSION: 'retrieved.root.config.version',
		RETRIEVED_ROOT_BASE_URL: 'retrieved.root.config.base.url',
		RETRIEVED_APP_ENDPOINT: 'retrieved.app.endpoint',
		RETRIEVED_APP_BASE_URL: 'retrieved.app.base.url',
		RETRIEVED_APP_OBJECT: 'retrieved.app.object',
		RETRIEVE_APP_OBJECT_FAILED: 'retrieve.app.object.failed',
	},
} as const
