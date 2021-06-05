import { initialState } from './Settings'

export type SettingsState = typeof initialState

export interface SettingsContext extends SettingsState {
	setPrompt(prompt: SettingsState['prompt']): void
}
