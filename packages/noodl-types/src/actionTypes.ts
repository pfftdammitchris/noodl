export interface UncommonActionObjectProps {
	contentType?: string // ex: "messageHidden"
	dataKey?: any
	dataObject?: any
	destination?: string
	funcName: string
	object?: any
	popUpView?: string
	reload?: boolean
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

export interface ActionObject<T extends string = any> {
	actionType: T
	[key: string]: any
}

export interface BuiltInActionObject
	extends ActionObject,
		Pick<
			UncommonActionObjectProps,
			'contentType' | 'funcName' | 'reload' | 'viewTag'
		> {
	actionType: 'builtIn'
	[key: string]: any
}

export interface EvalActionObject
	extends ActionObject,
		Pick<UncommonActionObjectProps, 'object'> {
	actionType: 'evalObject'
	[key: string]: any
}

export interface PageJumpActionObject
	extends ActionObject,
		Pick<UncommonActionObjectProps, 'destination'> {
	actionType: 'pageJump'
	[key: string]: any
}

export interface PopupActionObject<V extends string = any>
	extends ActionObject {
	actionType: 'popUp'
	popUpView: V
	[key: string]: any
}

export interface PopupDismissActionObject
	extends ActionObject,
		Pick<UncommonActionObjectProps, 'popUpView'> {
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

export type UpdateActionObject =
	| ({
			actionType: 'updateObject'
			[key: string]: any
	  } & Pick<UncommonActionObjectProps, 'dataObject' | 'dataKey'>)
	| ({
			actionType: 'updateObject'
			[key: string]: any
	  } & Pick<UncommonActionObjectProps, 'object'>)
