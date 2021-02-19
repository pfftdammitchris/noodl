export const DEFAULT_CONFIG_HOSTNAME = 'public.aitmed.com'
export const DEFAULT_CONFIG = 'aitmed'
export const DEFAULT_CONFIG_FILEPATH = 'noodl.yml'
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
		SET_SERVER_OPTIONS: 'set.servefr.options',
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
	SERVER_FILES: 'server.files',
	RUN_SERVER: 'run.server',
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
	[panelId.SERVER_FILES]: {
		id: panelId.SERVER_FILES,
		label: 'Retrieve all necessary files referenced in a config',
	},
	[panelId.RUN_SERVER]: {
		id: panelId.RUN_SERVER,
		label: 'Run the server',
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

export const action = {
	BUILTIN: 'builtIn',
	EVALOBJECT: 'evalObject',
	PAGEJUMP: 'pageJump',
	POPUP: 'popUp',
	POPUPDISMISS: 'popUpDismiss',
	REFRESH: 'refresh',
	SAVEOBJECT: 'saveObject',
	UPDATEOBJECT: 'updateObject',
} as const

export const component = {
	BUTTON: 'button',
	CHART: 'chart',
	DIVIDER: 'divider',
	FOOTER: 'footer',
	HEADER: 'header',
	IMAGE: 'image',
	LABEL: 'label',
	LIST: 'list',
	LISTITEM: 'listItem',
	PAGE: 'page',
	PLUGIN: 'plugin',
	PLUGINHEAD: 'pluginHead',
	PLUGINBODYTAIL: 'pluginBodyTail',
	POPUP: 'popUp',
	REGISTER: 'register',
	SELECT: 'select',
	SCROLLVIEW: 'scrollView',
	TEXTFIELD: 'textField',
	TEXTVIEW: 'textView',
	VIDEO: 'video',
	VIEW: 'view',
} as const
