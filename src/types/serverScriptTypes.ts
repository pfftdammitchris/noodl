import { serverScript } from '../constants'

export type Action =
	| { type: typeof serverScript.action.SET_CONFIG; config: State['config'] }
	| {
			type: typeof serverScript.action.SET_DATA_SOURCE
			dataSource: State['dataSource']
	  }
	| { type: typeof serverScript.action.SET_DIR_FILES; dirFiles: string[] }
	| { type: typeof serverScript.action.SET_STEP; step: State['step'] }

// export type Step

export interface State {
	config: string
	dataSource: '' | 'fs' | 'remote'
	dirFiles: string[]
	step: '' | typeof serverScript.step[keyof typeof serverScript.step]
	spinner: boolean
}
