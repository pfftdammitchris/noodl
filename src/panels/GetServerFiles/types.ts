import { MetadataGroup } from '../../types'
import { initialState } from './GetServerFiles'
import * as c from './constants'

export namespace GetServerFiles {
	export type State = typeof initialState

	export interface Context extends State {
		consumeMissingFiles(): void
		insertMissingFiles(files: MetadataObject[]): void
		setOn(opts: any): void
		setStep(step: Step): void
	}

	export type GroupedMetadataObjects = Record<
		keyof GroupedFiles,
		MetadataObject[]
	>

	export type GroupedFiles = Record<MetadataGroup, { [raw: string]: File }>

	export interface File extends MetadataObject {
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

	export type Step = typeof c.step[keyof typeof c.step] | ''
}
