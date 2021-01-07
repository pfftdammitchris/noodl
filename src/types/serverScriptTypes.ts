import { serverScript } from '../constants'

export type Action =
	| { type: typeof serverScript.action.SET_CONFIG; config: State['config'] }
	| {
			type: typeof serverScript.action.SET_DATA_SOURCE
			dataSource: State['dataSource']
	  }
	| { type: typeof serverScript.action.SET_DIR_FILES; dirFiles: string[] }
	| {
			type: typeof serverScript.action.SET_STEP
			step: State['step']
			options?: any
	  }

// export type Step

export interface State {
	config: string
	dataSource: '' | 'fs' | 'remote'
	dirFiles: string[]
	step: '' | typeof serverScript.step[keyof typeof serverScript.step]
	stepContext: Partial<
		{
			[K in typeof serverScript.step.DOWNLOAD_ASSETS]: {
				current: {
					images: string[]
					other: string[]
					pdfs: string[]
					videos: string[]
					totalPreloadPages: number
					totalPages: number
					failed: string[]
				}
				images: string[]
				other: string[]
				pdfs: string[]
				videos: string[]
				failedCount: number
				totalPages: number
				totalPreloadPages: number
			}
		} &
			{
				[K in Exclude<
					typeof serverScript.step[keyof typeof serverScript.step],
					typeof serverScript.step.DOWNLOAD_ASSETS
				>]: any
			}
	>
}
