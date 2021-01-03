import { IfObject } from './uncategorizedTypes'

export interface ActionObject<T extends string = any> {
	actionType: T
	dataKey?: any
	dataObject?: any
	reload?: boolean
	viewTag?: string
	wait?: boolean | number
	[key: string]: any
}

export interface BuiltInActionObject<FuncName extends string = any>
	extends ActionObject {
	actionType: 'builtIn'
	funcName: FuncName
	contentType?: string // ex: "messageHidden"
	viewTag?: string
	[key: string]: any
}

export interface EvalActionObject extends ActionObject {
	actionType: 'evalObject'
	object?: Function | IfObject
	[key: string]: any
}

export interface PageJumpActionObject<D extends string = any>
	extends ActionObject {
	actionType: 'pageJump'
	destination: D
	[key: string]: any
}

export interface PopupActionObject<V extends string = any>
	extends ActionObject {
	actionType: 'popUp'
	popUpView: V
	[key: string]: any
}

export interface PopupDismissActionObject<V extends string = any>
	extends ActionObject {
	actionType: 'popUpDismiss'
	popUpView: V
	[key: string]: any
}

export interface RefreshActionObject extends ActionObject {
	actionType: 'refresh'
	[key: string]: any
}

export interface SaveActionObject extends ActionObject {
	actionType: 'saveObject'
	object?: [string | ((...args: any[]) => any)] | ((...args: any[]) => any)
	[key: string]: any
}

export type UpdateActionObject<T = any> =
	| {
			actionType: 'updateObject'
			dataObject?: string // ex: "BLOB"
			dataKey?: string
			[key: string]: any
	  }
	| {
			actionType: 'updateObject'
			object?: T
			[key: string]: any
	  }
