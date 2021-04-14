import {
	ActionObject,
	ActionType,
	ComponentObject,
	ComponentType,
	EmitObject,
	IfObject,
	StyleBorderObject,
} from 'noodl-types'
import yaml, { Pair, YAMLMap } from 'yaml'
import { ScriptObject } from '../api/Scripts'
import { isYAMLMap } from './doc'
import Utils from '../api/Utils'
import * as n from '../utils/noodl-utils'
import * as u from '../utils/common'

export const id = {
	ACTION_TYPES: 'ACTION_TYPES',
	ACTION_OBJECTS: 'ACTION_OBJECTS',
	BUILTIN_FUNC_NAMES: 'BUILTIN_FUNC_NAMES',
	COMPONENT_KEYS: 'COMPONENT_KEYS',
	COMPONENT_OBJECTS: 'COMPONENT_OBJECTS',
	COMPONENT_TYPES: 'COMPONENT_TYPES',
	EMIT_OBJECTS: 'EMIT_OBJECTS',
	IF_OBJECTS: 'IF_OBJECTS',
	OBJECTS_THAT_CONTAIN_THESE_KEYS: 'OBJECTS_THAT_CONTAIN_THESE_KEYS',
	REFERENCES: 'REFERENCES',
	RETRIEVE_URLS: 'RETRIEVE_URLS',
	STYLE_BORDER_OBJECTS: 'STYLE_BORDER_OBJECTS',
	STYLE_PROPERTIES: 'STYLE_PROPERTIES',
	// Action object props
	BUILTIN_ACTION_PROPS: 'BUILTIN_ACTION_PROPS',
	EVALOBJECTACTION_PROPS: 'EVALOBJECTACTION_PROPS',
	PAGEJUMP_ACTION_PROPS: 'PAGEJUMP_ACTION_PROPS',
	POPUP_ACTION_PROPS: 'POPUP_ACTION_PROPS',
	POPUPDISMISS_ACTION_PROPS: 'POPUPDISMISS_ACTION_PROPS',
	REFRESH_ACTION_PROPS: 'REFRESH_ACTION_PROPS',
	SAVEOBJECT_ACTION_PROPS: 'SAVEOBJECT_ACTION_PROPS',
	UPDATEOBJECT_ACTION_PROPS: 'UPDATEOBJECT_ACTION_PROPS',
	// Component object props
	BUTTON_COMPONENT_PROPS: 'BUTTON_COMPONENT_PROPS',
	DIVIDER_COMPONENT_PROPS: 'DIVIDER_COMPONENT_PROPS',
	IMAGE_COMPONENT_PROPS: 'IMAGE_COMPONENT_PROPS',
	LABEL_COMPONENT_PROPS: 'LABEL_COMPONENT_PROPS',
	LIST_COMPONENT_PROPS: 'LIST_COMPONENT_PROPS',
	LISTITEM_COMPONENT_PROPS: 'LISTITEM_COMPONENT_PROPS',
	POPUP_COMPONENT_PROPS: 'POPUP_COMPONENT_PROPS',
	SCROLLVIEW_COMPONENT_PROPS: 'SCROLLVIEW_COMPONENT_PROPS',
	SELECT_COMPONENT_PROPS: 'SELECT_COMPONENT_PROPS',
	TEXTFIELD_COMPONENT_PROPS: 'TEXTFIELD_COMPONENT_PROPS',
	TEXTVIEW_COMPONENT_PROPS: 'TEXTVIEW_COMPONENT_PROPS',
	VIEW_COMPONENT_PROPS: 'VIEW_COMPONENT_PROPS',
} as const

export interface Store {
	actions: Partial<Record<string, ActionObject[]>>
	actionTypes: string[]
	components: Partial<Record<string, ComponentObject[]>>
	componentKeys: string[]
	componentTypes: string[]
	emit: EmitObject[]
	funcNames: string[]
	if: IfObject[]
	references: string[]
	styleKeys: string[]
	styles: {
		border: StyleBorderObject[]
	}
	urls: string[]
	propCombos: {
		actions: {
			[actionType: string]: { [key: string]: any[] }
		}
		components: {
			[componentType: string]: { [key: string]: any[] }
		}
	}
	containedKeys: {
		[keyword: string]: any[]
	}
}

const scripts: Record<string, () => ScriptObject> = {}

scripts[id.ACTION_OBJECTS] = {
	label: 'Retrieve all action objects',
	cond: 'map',
	fn(node: YAMLMap, store) {
		if (Utils.identify.action.any(node)) {
			const actionType = node.get('actionType') as string
			if (!store.actions[actionType]) store.actions[actionType] = []
			store.actions[actionType].push(node.toJSON())
		}
	},
}

scripts[id.ACTION_TYPES] = {
	label: 'Retrieve all action types',
	fn(node: Pair<any, any>, store) {
		if (Utils.identify.keyValue.actionType(node)) {
			if (!store.actionTypes?.includes(node.value.value)) {
				store.actionTypes.push(node.value.value)
			}
		}
	},
}

scripts[id.STYLE_BORDER_OBJECTS] = {
	label: 'Retrieve all style border objects',
	fn(node, store) {
		if (Utils.identify.style.border(node)) {
			if (!store.styles.border) store.styles.border = []
			store.styles.border.push(node)
		}
	},
}

scripts[id.BUILTIN_FUNC_NAMES] = {
	label: 'Retrieve all builtIn action funcNames',
	fn(node: Pair<any, any>, store) {
		if (Utils.identify.keyValue.funcName(node)) {
			if (!store.funcNames?.includes(node.value.value)) {
				store.funcNames.push(node.value.value)
			}
		}
	},
}

scripts[id.COMPONENT_KEYS] = {
	label: 'Retrieve all component keys',
	fn(node: YAMLMap<any>, store) {
		if (Utils.identify.component.any(node)) {
			node.items.forEach((pair) => {
				if (!store.componentKeys?.includes(pair.key.value)) {
					store.componentKeys.push(pair.key.value)
				}
			})
		}
	},
}

scripts[id.COMPONENT_OBJECTS] = {
	label: 'Retrieve all component objects',
	fn(node: YAMLMap, store) {
		if (Utils.identify.component.any(node)) {
			const componentType = node.get('type') as any
			if (!store.components[componentType]) store.components[componentType] = []
			store.components[componentType].push(node.toJSON())
		}
	},
}

scripts[id.COMPONENT_TYPES] = {
	label: 'Retrieve all component types',
	fn(node: YAMLMap, store) {
		if (Utils.identify.component.any(node)) {
			if (!store.componentTypes.includes(node.get('type'))) {
				store.componentTypes.push(node.get('type'))
			}
		}
	},
}

scripts[id.EMIT_OBJECTS] = {
	label: 'Retrieve all emit objects',
	fn(node: YAMLMap, store) {
		if (Utils.identify.emit(node)) {
			if (!store.emit) store.emit = []
			store.emit.push(node.get('emit'))
		}
	},
}

scripts[id.IF_OBJECTS] = {
	label: 'Retrieve all "if" objects',
	fn(node: YAMLMap, store) {
		if (Utils.identify.if(node)) {
			if (!store.if) store.if = []
			store.if.push(node.get('if'))
		}
	},
}

scripts[id.OBJECTS_THAT_CONTAIN_THESE_KEYS] = {
	label: `Retrieve all objects that contain the specified keys`,
	fn(node, store) {
		const keys = ['contentType']
		const numKeys = keys.length
		if (isYAMLMap(node)) {
			for (let index = 0; index < numKeys; index++) {
				const key = keys[index] || ''
				if ((node as YAMLMap).has(key)) {
					if (!Array.isArray(store.containedKeys[key])) {
						store.containedKeys[key] = []
					}
					store.containedKeys[key].push(node.toJSON())
				}
			}
		}
	},
}

scripts[id.REFERENCES] = () => {
	const context = new Map<string, string[]>()
	const getPageName = (doc: yaml.Document) => doc.contents.items[0].key.value

	return {
		label: 'Retrieve all references',
		fn({ key, node, path }, store) {
			let pageName = n.isPageDocument(path[0]) ? getPageName(path[0]) : ''
			let references: string[] | undefined = context.get(pageName)

			if (!store.context) store.context = context

			if (pageName && !references) {
				references = []
				context.set(pageName, references)
			}

			if (Utils.identify.scalar.reference(node)) {
				const reference = String(node.value)
				if (!references?.includes(reference)) {
					if (key === 'key') {
						//
					} else if (key === 'value') {
						//
					} else if (u.isNum(key)) {
						//
					}
					if (pageName) {
						references?.push(reference)
					}
				}
			}
		},
	}
}

scripts[id.RETRIEVE_URLS] = {
	label: 'Retrieve all urls/paths',
	fn(node: Pair, store) {
		if (Utils.identify.scalar.url(node)) {
			if (!store.urls.includes(node.value)) store.urls.push(node.value)
		}
	},
}

scripts[id.STYLE_PROPERTIES] = {
	label: 'Retrieve all style properties',
	fn(node: Pair<any, any>, store) {
		if (Utils.identify.paths.style.any(node)) {
			if (isYAMLMap(node.value)) {
				node.value.items.forEach((pair: Pair<any, any>) => {
					if (pair.key?.value && !Utils.identify.scalar.reference(pair.key)) {
						if (!store.styleKeys.includes(pair.key.value)) {
							store.styleKeys.push(pair.key.value)
						}
					}
				})
			}
		}
	},
}

export function createActionPropComboScripts() {
	return [
		'builtIn',
		'evalObject',
		'pageJump',
		'popUp',
		'popUpDismiss',
		'refresh',
		'saveObject',
		'updateObject',
	].map((actionType) => ({
		id: id[`${actionType.toUpperCase()}_ACTION_PROPS`],
		label: `Retrieve props that may exist on ${actionType} action objects`,
		fn(node, store: Store) {
			if (Utils.identify.action[actionType](node)) {
				;(node as YAMLMap).items.forEach((pair: Pair<any, any>) => {
					if (!Utils.identify.scalar.reference(pair.key)) {
						const actions = store.propCombos.actions
						if (!actions[actionType]) actions[actionType] = {}
						if (!actions[actionType][pair.key.value]) {
							actions[actionType][pair.key.value] = []
						}
						if (
							!actions[actionType][pair.key.value]?.includes(pair.value.value)
						) {
							actions[actionType][pair.key.value]?.push(pair.value.value)
						}
					}
				})
			}
		},
	})) as ScriptObject[]
}
export function createComponentPropComboScripts() {
	return [
		'button',
		'divider',
		'image',
		'label',
		'lael',
		'list',
		'listItem',
		'popUp',
		'scrollView',
		'select',
		'textField',
		'textView',
		'view',
		'chatList',
	].map((type) => ({
		id: id[`${type.toUpperCase()}_ACTION_PROPS`],
		label: `Retrieve props that may exist on ${type} action objects`,
		fn(node, store: Store) {
			if (Utils.identify.component[type]?.(node)) {
				;(node as YAMLMap).items.forEach((pair: Pair<any, any>) => {
					if (!Utils.identify.scalar.reference(pair.key)) {
						const components = store.propCombos.components
						if (!components[type]) components[type] = {}
						if (!components[type][pair.key?.value]) {
							components[type][pair.key.value] = []
						}
						if (
							!components[type][pair.key?.value]?.includes(pair.value?.value)
						) {
							components[type][pair.key.value]?.push(pair.value?.value)
						}
					}
				})
			}
		},
	})) as ScriptObject[]
}

export default scripts
