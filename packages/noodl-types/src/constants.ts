export const action = {
	BUILTIN: 'builtIn',
	EVALOBJECT: 'evalObject',
	OPENCAMERA: 'openCamera',
	OPENPHOTOLIBRARY: 'openPhotoLibrary',
	OPENDOCUMENTMANAGER: 'openDocumentManager',
	PAGEJUMP: 'pageJump',
	POPUP: 'popUp',
	POPUPDISMISS: 'popUpDismiss',
	REFRESH: 'refresh',
	REGISTER: 'register',
	REMOVESIGNATURE: 'removeSignature',
	SAVEOBJECT: 'saveObject',
	SAVESIGNATURE: 'saveSignature',
	UPDATEOBJECT: 'updateObject',
} as const

//

export const actionTypes = Object.values(action)

export const component = {
	BUTTON: 'button',
	CANVAS: 'canvas',
	CHART: 'chart',
	CHATLIST: 'chatList',
	ECOSDOC: 'ecosDoc',
	DIVIDER: 'divider',
	FOOTER: 'footer',
	HEADER: 'header',
	IMAGE: 'image',
	LABEL: 'label',
	LIST: 'list',
	LISTITEM: 'listItem',
	MAP: 'map',
	PAGE: 'page',
	PLUGIN: 'plugin',
	PLUGINHEAD: 'pluginHead',
	PLUGINBODYTAIL: 'pluginBodyTail',
	POPUP: 'popUp',
	REGISTER: 'register',
	SELECT: 'select',
	SCROLLVIEW: 'scrollView',
	TEXTFIELD: 'textField',
	TEXTVIEW: 'textView',
	VIDEO: 'video',
	VIEW: 'view',
} as const

export const componentKeys = [
	'backgroundColor',
	'borderRadius',
	'chatItem',
	'children',
	'contentType',
	'dataId',
	'dataIn',
	'dataKey',
	'dataModel',
	'ecosObj',
	'height',
	'isEditable',
	'itemObject',
	'iteratorVar',
	'itmeObject',
	'listObject',
	'onChange',
	'onClick',
	'onInput',
	'optionKey',
	'options',
	'path',
	'pathSelected',
	'placeHolder',
	'placeholder',
	'refresh',
	'required',
	'style',
	'text',
	'text=func',
	'textAlign',
	'textBoard',
	'type',
	'viewTag',
	'width',
	'zIndex',
	'chatItem',
] as const

export const componentTypes = Object.values(component)

export const contentTypes = [
	'countryCode',
	'email',
	'file',
	'formattedDate',
	'formattedDuration',
	'hidden',
	'listObject',
	'messageHidden',
	'number',
	'password',
	'passwordHidden',
	'phone',
	'phoneNumber',
	'tel',
	'text',
	'timer',
	'videoSubStream',
] as const

export const deviceTypes = ['web', 'ios', 'android'] as const

export const styleKeys = [
	'FontSize',
	'axis',
	'background',
	'backgroundColor',
	'border',
	'borderColor',
	'borderRadius',
	'borderRaduis',
	'borderWidth',
	'boxShadow',
	'boxSizing',
	'color',
	'contentSize',
	'diaplay',
	'display',
	'filter',
	'float',
	'flex',
	'flexFlow',
	'fontColor',
	'fontFamily',
	'fontSize',
	'fontStyle',
	'fontWeight',
	'foontWeight',
	'height',
	'hieght',
	'isHidden',
	'justifyContent',
	'left',
	'letterSpacing',
	'lineHeight',
	'marginLeft',
	'marginTop',
	'onClick',
	'padding',
	'paddingBottom',
	'paddingLeft',
	'placeholder',
	'position',
	'required',
	'shadow',
	'text-align',
	'textAlign',
	'textDecoration',
	'textIndent',
	'top',
	'width',
	'zIndex',
] as const

export const userEvent = [
	'onBlur',
	'onClick',
	'onChange',
	'onFocus',
	'onHover',
	'onInput',
	'onMouseEnter',
	'onMouseLeave',
	'onMouseOut',
	'onMouseOver',
] as const
