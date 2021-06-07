import * as c from './constants'

export type PromptId = typeof c.prompts[keyof typeof c.prompts]

export interface PromptObject {
	key: '' | PromptId
	dir?: string
}
export interface SettingsContext extends PromptObject {
	setPrompt(prompt: PromptObject): void
}
