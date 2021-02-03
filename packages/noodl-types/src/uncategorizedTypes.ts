import { AnyActionObject } from './actionTypes'
import { StyleObject } from './styleTypes'

export type ActionChain = (AnyActionObject | EmitObject | GotoObject)[]

export interface EmitObject {
	emit: {
		actions: any[]
		dataKey?: string | { [key: string]: string }
		[key: string]: any
	}
	[key: string]: any
}

export type GotoUrl = string

export interface GotoObject {
	goto: string
	[key: string]: any
}

export interface IfObject {
	if: [any, any, any]
	[key: string]: any
}

export type Path = string | EmitObject | IfObject

export type TextBoardObject = (
	| { color?: string; text?: string }
	| { br?: null | '' }
)[]

export interface ToastObject {
	message?: string
	style?: StyleObject
}
