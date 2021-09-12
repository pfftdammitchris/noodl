export const DEFAULT_OUTPUT_DIR = 'generated'
export const DEFAULT_CONFIG_HOSTNAME = 'public.aitmed.com'
export const DEFAULT_CONFIG = 'aitmed'
export const DEFAULT_SERVER_HOSTNAME = '127.0.0.1'
export const DEFAULT_SERVER_PATH = 'server'
export const DEFAULT_SERVER_PORT = 3001
export const DEFAULT_SERVER_PROTOCOL = 'http'
export const DEFAULT_WSS_PORT = 3002
export const DEFAULT_PANEL = 'select'

export const app = {
	INITIAL_OPTION: 'INITIAL_OPTION',
	action: {
		HIGHLIGHT_PANEL: 'HIGHLIGHT_PANEL',
		SET_CAPTION: 'SET_CAPTION',
		SET_SERVER_OPTIONS: 'SET_SERVER_OPTIONS',
		SET_OBJECTS_JSON_OPTIONS: 'SET_OBJECTS_JSON_OPTIONS',
		SET_OBJECTS_YML_OPTIONS: 'SET_OBJECTS_YML_OPTIONS',
		SET_PANEL: 'SET_PANEL',
		SET_SPINNER: 'SET_SPINNER',
	},
} as const

export const GENERATE_DIR_KEY = 'generateDir'

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

export const placeholder = {
	cadlBaseUrl: '\\${cadlBaseUrl}',
	cadlVersion: '\\${cadlVersion}',
	designSuffix: '\\${designSuffix}',
} as const
