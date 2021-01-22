export const DEFAULT_CONFIG_HOSTNAME = 'public.aitmed.com'
export const DEFAULT_CONFIG = 'aitmed'
export const DEFAULT_CONFIG_FILEPATH = 'noodl.json'
export const DEFAULT_GENERATED_DIR = 'generated'
export const DEFAULT_JSON_OBJECTS_DIR = `${DEFAULT_GENERATED_DIR}/json`
export const DEFAULT_YML_OBJECTS_DIR = `${DEFAULT_GENERATED_DIR}/yml`
export const DEFAULT_SERVER_HOSTNAME = '127.0.0.1'
export const DEFAULT_SERVER_PATH = 'server'
export const DEFAULT_SERVER_PORT = 3000
export const DEFAULT_SERVER_PROTOCOL = 'http'

export const app = {
	INITIAL_OPTION: 'retrieve.objects',
	action: {
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
	SELECT_ROUTE: 'select.route',
	RETRIEVE_OBJECTS: 'retrieve.objects',
	RETRIEVE_KEYWORDS: 'retrieve.keywords',
	SERVER: 'server',
} as const

export const panel = {
	[panelId.RETRIEVE_OBJECTS]: {
		id: panelId.RETRIEVE_OBJECTS,
		label: 'Retrieve objects',
	},
	[panelId.RETRIEVE_KEYWORDS]: {
		id: panelId.RETRIEVE_KEYWORDS,
		label: 'Retrieve keywords',
	},
	[panelId.SELECT_ROUTE]: {
		id: panelId.SELECT_ROUTE,
		label: 'Select route',
	},
	[panelId.SERVER]: {
		id: panelId.SERVER,
		label: 'Start a server',
	},
} as const

export const retrieveObjectsScript = {
	action: {
		SET_EXT: 'set.ext',
		SET_CONFIG: 'set.config',
		SET_CAPTION: 'set.caption',
		SET_STATUS: 'set.status',
	},
	step: {
		SET_EXT: 'set.ext',
		SET_CONFIG: 'set.config',
		RETRIEVE_OBJECTS: 'retrive.objects',
	},
	status: {
		IDLE: 'idle',
		RETRIEVING_OBJECTS: 'retrieving.objects',
	},
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
		SCAN_ASSETS: 'scan.assets',
		DOWNLOAD_ASSETS: 'download.assets',
	},
} as const
