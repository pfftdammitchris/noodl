import useServerFiles from './useServerFiles'
import * as c from './constants'

export type ServerFilesAction =
	| {
			type: typeof c.action.SET_STEP
			step: Exclude<ServerFilesState['step'], typeof c['step']['SCAN_ASSETS']>
			options?: any
	  }
	| {
			type: typeof c.action.SET_STEP
			step: typeof c.step.SCAN_ASSETS
			assets: string[]
	  }
	| {
			type: typeof c.action.DOWNLOAD
			url: string | string[]
	  }
	| {
			type: typeof c.action.INSERT_MISSING_FILES
			files: GroupedMetadataObjects
	  }
	| { type: typeof c.action.CONSUME_MISSING_FILES }
	| ({ type: typeof c.action.SET_FILE_STATUS } & Pick<
			ServerFilesFile,
			'group' | 'link' | 'status'
	  >)

export interface ServerFilesState {
	files: {
		contained: ServerFilesGroupedFiles
		missing: ServerFilesGroupedFiles
	}
	step: '' | typeof c.step[keyof typeof c.step]
}

export type ServerFilesContext = ServerFilesState &
	Pick<
		ReturnType<typeof useServerFiles>,
		'consumeMissingFiles' | 'insertMissingFiles' | 'setStep'
	>

export interface ServerFilesGroupedFiles {
	documents: { [url: string]: ServerFilesFile }
	images: { [url: string]: ServerFilesFile }
	videos: { [url: string]: ServerFilesFile }
}

export type GroupedMetadataObjects = Record<
	keyof ServerFilesGroupedFiles,
	MetadataObject[]
>

export interface ServerFilesFile extends MetadataObject {
	status: null | typeof c.file.status[keyof typeof c.file.status]
}

export interface MetadataObject {
	ext: string
	filepath?: any
	link: string
	group: 'image' | 'document' | 'script' | 'video'
	pathname: string
}
