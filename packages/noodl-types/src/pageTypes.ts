import { ComponentObject } from './componentTypes'

export interface PageObject {
	components: ComponentObject[]
	final?: string // ex: "..save"
	init?: string | string[] // ex: ["..formData.edge.get", "..formData.w9.get"]
	module?: string
	pageNumber?: string
	viewport?: any
	lastTop?: number
	[key: string]: any
}
