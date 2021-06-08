import { initialState } from './Settings'
import * as c from './constants'

export type PromptId = typeof c.prompts[keyof typeof c.prompts]

export type SettingsState = typeof initialState

export interface SettingsContext extends SettingsState {
	setPrompt(prompt: SettingsState['prompt']): void
}
