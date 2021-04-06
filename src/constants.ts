export const DEFAULT_CONFIG_HOSTNAME = 'public.aitmed.com'
export const DEFAULT_CONFIG = 'aitmed'
export const DEFAULT_SERVER_HOSTNAME = '127.0.0.1'
export const DEFAULT_SERVER_PATH = 'server'
export const DEFAULT_SERVER_PORT = 3000
export const DEFAULT_SERVER_PROTOCOL = 'http'

export const EDIT_PANEL = 'edit-panel'

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

const _panel = {
	RETRIEVE_OBJECTS: {
		label: 'Retrieve objects',
	},
	RETRIEVE_KEYWORDS: {
		label: 'Retrieve keywords',
	},
	SERVER_FILES: {
		label: 'Retrieve all necessary files referenced in a config',
	},
	RUN_SERVER: {
		label: 'Run the server',
	},
} as const

export const panel = Object.entries(_panel).reduce((acc, [key, val]) => {
	acc[key] = {
		label: val.label,
		value: key,
	}
	return acc
}, {}) as Record<
	keyof typeof _panel,
	typeof _panel[keyof typeof _panel] & { value: keyof typeof _panel }
>

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
