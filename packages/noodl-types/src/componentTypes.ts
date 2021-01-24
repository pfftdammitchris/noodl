import { ActionObject } from './actionTypes'
import { EventType } from './constantTypes'
import { StyleObject, StyleTextAlign, StyleTextAlignObject } from './styleTypes'
import {
	ActionChain,
	EmitObject,
	GotoObject,
	IfObject,
	TextBoardObject,
} from './uncategorizedTypes'

export type AnyComponentObject =
	| ButtonComponentObject
	| DividerComponentObject
	| FooterComponentObject
	| HeaderComponentObject
	| ImageComponentObject
	| LabelComponentObject
	| ListComponentObject
	| ListItemComponentObject
	| PageComponentObject
	| PluginComponentObject
	| PluginHeadComponentObject
	| PluginBodyTailComponentObject
	| PopUpComponentObject
	| RegisterComponentObject
	| SelectComponentObject
	| ScrollViewComponentObject
	| TextFieldComponentObject
	| TextViewComponentObject
	| VideoComponentObject
	| ViewComponentObject

export type UncommonComponentObjectProps = {
	[key in EventType]: ActionChain
} & {
	actions?: (ActionObject | EmitObject | GotoObject)[]
	contentType?: string
	dataKey?: string
	isEditable?: boolean
	iteratorVar?: string
	listObject?: '' | any[]
	onEvent?: string
	optionKey?: string
	options?: any[]
	path?: string | IfObject | EmitObject
	pathSelected?: string
	placeholder?: string | EmitObject
	popUpView?: string
	poster?: string
	refresh?: boolean
	required?: boolean
	text?: string
	textBoard?: TextBoardObject
	textAlign?: StyleTextAlign | StyleTextAlignObject
	'text=func'?: string
	viewTag?: string
	videoFormat?: string
}

export interface ComponentObject<T extends string = any> {
	type: T
	style?: StyleObject
	children?: any[]
	[key: string]: any
}

export interface ButtonComponentObject
	extends ComponentObject,
		Pick<UncommonComponentObjectProps, 'contentType' | 'text'> {
	type: 'button'
	[key: string]: any
}

export interface DividerComponentObject extends ComponentObject {
	type: 'divider'
	[key: string]: any
}

export interface FooterComponentObject extends ComponentObject {
	type: 'footer'
	[key: string]: any
}

export interface HeaderComponentObject extends ComponentObject {
	type: 'header'
	[key: string]: any
}

export interface ImageComponentObject
	extends ComponentObject,
		Pick<UncommonComponentObjectProps, 'path'> {
	type: 'image'
	[key: string]: any
}

export interface LabelComponentObject
	extends ComponentObject,
		Pick<
			UncommonComponentObjectProps,
			'contentType' | 'dataKey' | 'text' | 'textBoard' | 'text=func'
		> {
	type: 'label'
	[key: string]: any
}

export interface ListComponentObject
	extends ComponentObject,
		Pick<
			UncommonComponentObjectProps,
			'contentType' | 'iteratorVar' | 'listObject'
		> {
	type: 'list'
	[key: string]: any
}

export interface ListItemComponentObject extends ComponentObject {
	type: 'listItem'
	[key: string]: any
}

export interface PageComponentObject
	extends ComponentObject,
		Pick<UncommonComponentObjectProps, 'path'> {
	type: 'page'
	[key: string]: any
}

export interface PluginComponentObject
	extends ComponentObject,
		Pick<UncommonComponentObjectProps, 'path'> {
	type: 'plugin'
	[key: string]: any
}

export interface PluginHeadComponentObject
	extends ComponentObject,
		Pick<UncommonComponentObjectProps, 'path'> {
	type: 'pluginHead'
	[key: string]: any
}

export interface PluginBodyTailComponentObject
	extends ComponentObject,
		Pick<UncommonComponentObjectProps, 'path'> {
	type: 'pluginBodyTail'
	[key: string]: any
}

export interface PopUpComponentObject
	extends ComponentObject,
		Pick<UncommonComponentObjectProps, 'popUpView'> {
	type: 'popUp'
	[key: string]: any
}

export interface RegisterComponentObject
	extends ComponentObject,
		Pick<UncommonComponentObjectProps, 'actions' | 'onEvent'> {
	type: 'register'
	[key: string]: any
}

export interface SelectComponentObject
	extends ComponentObject,
		Pick<UncommonComponentObjectProps, 'optionKey' | 'options'> {
	type: 'select'
	[key: string]: any
}

export interface ScrollViewComponentObject extends ComponentObject {
	type: 'scrollView'
	[key: string]: any
}

export interface TextFieldComponentObject
	extends ComponentObject,
		Pick<UncommonComponentObjectProps, 'dataKey' | 'placeholder'> {
	type: 'textField'
	[key: string]: any
}

export interface TextViewComponentObject extends ComponentObject {
	type: 'textView'
	[key: string]: any
}

export interface VideoComponentObject
	extends ComponentObject,
		Pick<UncommonComponentObjectProps, 'path' | 'poster' | 'videoFormat'> {
	type: 'video'
	[key: string]: any
}

export interface ViewComponentObject extends ComponentObject {
	type: 'view'
	[key: string]: any
}
