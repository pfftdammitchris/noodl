export const action = {
	CONSUME_MISSING_FILES: 'consume.files',
	DOWNLOAD: 'download',
	DOWNLOADED: 'downloaded',
	DOWNLOAD_FAILED: 'download.failed',
	INSERT_MISSING_FILES: 'set.files',
	SET_ROOT_CONFIG: 'set.root.config',
	SET_APP_CONFIG: 'set.app.config',
	SET_SERVER_DIR: 'set.server.dir',
	SET_STEP: 'set.step',
	SET_DIR_FILES: 'set.dir.files',
	SET_PENDING: 'set.pending',
	SET_FILE_STATUS: 'set.file.status',
	SET_ASSET_METADATA_OBJECTS: 'set.asset.metadata.objects',
	SET_YML_METADATA_OBJECTS: 'set.yml.metadata.objects',
} as const

export const step = {
	INITIALIZING: 'initializing',
	PROMPT_CONFIG: 'prompt.config',
	LOAD_FILES: 'load.files',
	SCAN_ASSETS: 'scan.assets',
	DOWNLOAD_ASSETS: 'download.assets',
	RUN_SERVER: 'run.server',
} as const

export const file = {
	status: {
		PENDING: 'pending',
		DOWNLOADING: 'downloading',
		DOWNLOADED: 'downloaded',
	},
} as const
