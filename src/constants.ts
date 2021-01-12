import path from 'path'

function getFilePath(...s: string[]) {
	return path.resolve(path.join(process.cwd(), ...s))
}

export const DEFAULT_BASE_URL = 'https://public.aitmed.com'
export const DEFAULT_CONFIG = 'aitmed'
export const DEFAULT_CONFIG_PATH = 'noodl.json'
export const DEFAULT_SERVER_URL = 'http://127.0.0.1'
export const DEFAULT_SERVER_PATH = 'server'
export const DEFAULT_SERVER_PORT = 3000

export const app = {
	action: {
		SET_OWN_CONFIG: 'set.own.config',
		SET_CAPTION: 'set.caption',
		SET_SERVER_OPTIONS: 'set.server.options',
		SET_OBJECTS_JSON_OPTIONS: 'set.objects.json.options',
		SET_OBJECTS_YML_OPTIONS: 'set.obects.yml.options',
		SET_PANEL: 'set.panel',
		SET_SPINNER: 'set.spinner',
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

export const panelId = {
	SELECT_ROUTE: 'select-route',
	RETRIEVE_OBJECTS: 'retrieve-objects',
	RETRIEVE_KEYWORDS: 'retrieve-keywords',
	START_SERVER: 'start-server',
} as const

export const serverScript = {
	action: {
		SET_CONFIG: 'set.config',
		SET_STEP: 'set.step',
		SET_DIR_FILES: 'set.dir.files',
		SET_PENDING: 'set.pending',
		DOWNLOAD_ASSET: 'download.asset',
	},
	step: {
		CONFIG: 'config',
		LOAD_FILES: 'load.files',
		DOWNLOAD_ASSETS: 'download.assets',
	},
} as const
