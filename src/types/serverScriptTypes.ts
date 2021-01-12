import { serverScript } from '../constants'

export type Action =
	| { type: typeof serverScript.action.SET_CONFIG; config: State['config'] }
	| { type: typeof serverScript.action.SET_DIR_FILES; dirFiles: string[] }
	| {
			type: typeof serverScript.action.SET_STEP
			step: Exclude<
				State['step'],
				typeof serverScript['step']['DOWNLOAD_ASSETS']
			>
			options?: any
	  }
	| {
			type: typeof serverScript.action.SET_STEP
			step: typeof serverScript.step.DOWNLOAD_ASSETS
			assets: string[]
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
				assets: string[]
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
