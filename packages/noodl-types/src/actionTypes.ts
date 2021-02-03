export interface UncommonActionObjectProps {
	contentType?: string // ex: "messageHidden"
	dataKey?: any
	dataObject?: any
	destination?: string
	dismissOnTouchOutside?: boolean
	evolve?: boolean
	funcName: string
	object?: any
	popUpView?: string
	reload?: boolean
	timer?: number
	viewTag?: string
	wait?: boolean | number
}

export type AnyActionObject =
	| BuiltInActionObject
	| EvalActionObject
	| PageJumpActionObject
	| PopupActionObject
	| PopupDismissActionObject
	| RefreshActionObject
	| SaveActionObject
	| UpdateActionObject

export interface ActionObject<T extends string = any> {
	actionType: T
	[key: string]: any
}

export interface BuiltInActionObject
	extends ActionObject,
		Pick<
			UncommonActionObjectProps,
			'contentType' | 'dataKey' | 'evolve' | 'funcName' | 'reload' | 'viewTag'
		> {
	actionType: 'builtIn'
	[key: string]: any
}

export interface EvalActionObject
	extends ActionObject,
		Pick<UncommonActionObjectProps, 'dataKey' | 'dataObject' | 'object'> {
	actionType: 'evalObject'
	[key: string]: any
}

export interface PageJumpActionObject
	extends ActionObject,
		Pick<UncommonActionObjectProps, 'destination'> {
	actionType: 'pageJump'
	[key: string]: any
}

export interface PopupActionObject
	extends ActionObject,
		Pick<
			UncommonActionObjectProps,
			'dismissOnTouchOutside' | 'popUpView' | 'wait'
		> {
	actionType: 'popUp'
	[key: string]: any
}

export interface PopupDismissActionObject
	extends ActionObject,
		Pick<
			UncommonActionObjectProps,
			'dismissOnTouchOutside' | 'popUpView' | 'wait'
		> {
	actionType: 'popUpDismiss'
	[key: string]: any
}

export interface RefreshActionObject extends ActionObject {
	actionType: 'refresh'
	[key: string]: any
}

export interface SaveActionObject
	extends ActionObject,
		Pick<UncommonActionObjectProps, 'object'> {
	actionType: 'saveObject'
	[key: string]: any
}

export interface UpdateActionObject
	extends ActionObject,
		Pick<UncommonActionObjectProps, 'dataObject' | 'dataKey'> {}
