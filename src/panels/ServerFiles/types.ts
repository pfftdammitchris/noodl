import useServerFiles from './useServerFiles'
import { MetadataGroup } from '../../types'
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
			files: MetadataObject[]
	  }
	| { type: typeof c.action.CONSUME_MISSING_FILES }
	| ({ type: typeof c.action.SET_FILE_STATUS } & Pick<
			ServerFilesFile,
			'group' | 'raw' | 'status'
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

export type ServerFilesGroupedFiles = Record<
	MetadataGroup,
	{ [raw: string]: ServerFilesFile }
>

export type GroupedMetadataObjects = Record<
	keyof ServerFilesGroupedFiles,
	MetadataObject[]
>

export interface ServerFilesFile extends MetadataObject {
	status: typeof c.file.status[keyof typeof c.file.status]
}

export interface MetadataObject {
	ext: string
	filename: string
	filepath?: any
	link?: string
	group: MetadataGroup
	pathname: string
	raw: string
}
