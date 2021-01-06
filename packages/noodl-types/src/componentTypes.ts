import { ActionObject } from './actionTypes'
import { StyleObject } from './styleTypes'

export interface ComponentObject<T extends string = any> {
	type: T
	style: StyleObject
	children?: any[]
	[key: string]: any
}

export interface ButtonComponentObject extends ComponentObject {
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

export interface ImageComponentObject extends ComponentObject {
	type: 'image'
	path: string
	[key: string]: any
}

export interface LabelComponentObject extends ComponentObject {
	type: 'label'
	[key: string]: any
}

export interface ListComponentObject extends ComponentObject {
	type: 'list'
	iteratorVar: String
	listObject: any[]
	[key: string]: any
}

export interface ListItemComponentObject extends ComponentObject {
	type: 'listItem'
	[key: string]: any
}

export interface NoodlComponentObject extends ComponentObject {
	type: 'noodl'
	[key: string]: any
}

export interface PluginComponentObject extends ComponentObject {
	type: 'plugin'
	[key: string]: any
}

export interface PluginHeadComponentObject extends ComponentObject {
	type: 'pluginHead'
	[key: string]: any
}

export interface PluginBodyTailComponentObject extends ComponentObject {
	type: 'pluginBodyTail'
	[key: string]: any
}

export interface PopUpComponentObject extends ComponentObject {
	type: 'popUp'
	[key: string]: any
}

export interface RegisterComponentObject extends ComponentObject {
	type: 'register'
	onEvent?: string
	actions?: ActionObject[]
	[key: string]: any
}

export interface SelectComponentObject extends ComponentObject {
	type: 'select'
	[key: string]: any
}

export interface ScrollViewComponentObject extends ComponentObject {
	type: 'scrollView'
	[key: string]: any
}

export interface TextFieldComponentObject extends ComponentObject {
	type: 'textField'
	[key: string]: any
}

export interface TextViewComponentObject extends ComponentObject {
	type: 'textView'
	[key: string]: any
}

export interface VideoComponentObject extends ComponentObject {
	type: 'video'
	[key: string]: any
}

export interface ViewComponentObject extends ComponentObject {
	type: 'view'
	[key: string]: any
}
