import path from 'path'

const getFilePath = (...s: string[]) =>
	path.resolve(path.join(process.cwd(), ...s))

export const DEFAULT_BASE_URL = 'https://public.aitmed.com'
export const DEFAULT_CONFIG = 'aitmed'
export const DEFAULT_CONFIG_PATH = getFilePath('noodl.json')
export const DEFAULT_SERVER_URL = 'http://127.0.0.1'
export const DEFAULT_SERVER_PATH = getFilePath('server')
export const DEFAULT_SERVER_PORT = 3000

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
		SET_DATA_SOURCE: 'set.data.source',
		SET_DIR_FILES: 'set.dir.files',
		SET_PENDING: 'set.pending',
		DOWNLOAD_ASSET: 'download.asset',
	},
	step: {
		CONFIG: 'config',
		PROMPT_DATA_SOURCE: 'prompt.data.source',
		PROMPT_SERVER_DIR: 'prompt.server.dir',
		CONFIRM_USE_SERVER_DIR_FILES: 'confirm.use.server.dir.files',
		DOWNLOAD_ASSETS: 'download.assets',
	},
} as const
