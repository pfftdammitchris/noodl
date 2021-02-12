import {
	ActionObject,
	ActionType,
	ComponentObject,
	ComponentType,
	EmitObject,
	IfObject,
	StyleBorderObject,
} from 'noodl-types'
import { Pair, YAMLMap } from 'yaml/types'
import { NOODLTypesObserver } from '../api/createObjectScripts'
import { isYAMLMap } from './common'
import Utils from '../api/Utils'

export const id = {
	ACTION_TYPES: 'action.types',
	ACTION_OBJECTS: 'action.objects',
	BUILTIN_FUNC_NAMES: 'builtIn.func.names',
	COMPONENT_KEYS: 'component.keys',
	COMPONENT_OBJECTS: 'component.objects',
	COMPONENT_TYPES: 'component.types',
	EMIT_OBJECTS: 'emit.objects',
	IF_OBJECTS: 'if.objects',
	OBJECTS_THAT_CONTAIN_THESE_KEYS: 'objects.thataw.contain.these.keys',
	REFERENCES: 'references',
	RETRIEVE_URLS: 'retrieve.urls',
	STYLE_BORDER_OBJECTS: 'style.border.objects',
	STYLE_PROPERTIES: 'style.properties',
	// Action object props
	BUILTIN_ACTION_PROPS: 'builtIn.action.props',
	EVALOBJECTACTION_PROPS: 'evalObject.action.props',
	PAGEJUMP_ACTION_PROPS: 'pageJump.action.props',
	POPUP_ACTION_PROPS: 'popUp.action.props',
	POPUPDISMISS_ACTION_PROPS: 'popUpDismiss.action.props',
	REFRESH_ACTION_PROPS: 'refresh.action.props',
	SAVEOBJECT_ACTION_PROPS: 'saveObject.action.props',
	UPDATEOBJECT_ACTION_PROPS: 'updateObject.action.props',
	// Component object props
	BUTTON_COMPONENT_PROPS: 'button.component.props',
	DIVIDER_COMPONENT_PROPS: 'divider.component.props',
	IMAGE_COMPONENT_PROPS: 'image.component.props',
	LABEL_COMPONENT_PROPS: 'label.component.props',
	LIST_COMPONENT_PROPS: 'list.component.props',
	LISTITEM_COMPONENT_PROPS: 'listItem.component.props',
	POPUP_COMPONENT_PROPS: 'popUp.component.props',
	SCROLLVIEW_COMPONENT_PROPS: 'scrollView.component.props',
	SELECT_COMPONENT_PROPS: 'select.component.props',
	TEXTFIELD_COMPONENT_PROPS: 'textField.component.props',
	TEXTVIEW_COMPONENT_PROPS: 'textView.component.props',
	VIEW_COMPONENT_PROPS: 'view.component.props',
} as const

export interface Store {
	actions: Partial<{ [K in ActionType]: ActionObject[] }>
	actionTypes: string[]
	components: Partial<{ [K in ComponentType]: ComponentObject[] }>
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
			[K in ActionType]: { [key: string]: any[] }
		}
		components: {
			[K in ComponentType]: { [key: string]: any[] }
		}
	}
	containedKeys: {
		[keyword: string]: any[]
	}
}

const scripts = {} as { [K in typeof id[keyof typeof id]]: NOODLTypesObserver }

scripts[id.ACTION_OBJECTS] = {
	id: 'action.objects',
	label: 'Retrieve all action objects',
	fn(node: YAMLMap, store) {
		if (Utils.identify.action.any(node)) {
			const actionType = node.get('actionType')
			if (!store.actions[actionType]) store.actions[actionType] = []
			store.actions[actionType].push(node.toJSON())
		}
	},
}

scripts[id.ACTION_TYPES] = {
	id: 'action.types',
	label: 'Retrieve all action types',
	fn(node: Pair, store) {
		if (Utils.identify.keyValue.actionType(node)) {
			if (!store.actionTypes?.includes(node.value.value)) {
				store.actionTypes.push(node.value.value)
			}
		}
	},
}

scripts[id.STYLE_BORDER_OBJECTS] = {
	id: 'border.style.objects',
	label: 'Retrieve all style border objects',
	fn(node, store) {
		if (Utils.identify.style.border(node)) {
			if (!store.styles.border) store.styles.border = []
			store.styles.border.push(node)
		}
	},
}

scripts[id.BUILTIN_FUNC_NAMES] = {
	id: 'builtIn.funcNames',
	label: 'Retrieve all builtIn action funcNames',
	fn(node: Pair, store) {
		if (Utils.identify.keyValue.funcName(node)) {
			if (!store.funcNames?.includes(node.value.value)) {
				store.funcNames.push(node.value.value)
			}
		}
	},
}

scripts[id.COMPONENT_KEYS] = {
	id: 'component.keys',
	label: 'Retrieve all component keys',
	fn(node: YAMLMap, store) {
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
	id: 'component.objects',
	label: 'Retrieve all component objects',
	fn(node: YAMLMap, store) {
		if (Utils.identify.component.any(node)) {
			const componentType = node.get('type')
			if (!store.components[componentType]) store.components[componentType] = []
			store.components[componentType].push(node.toJSON())
		}
	},
}

scripts[id.COMPONENT_TYPES] = {
	id: 'component.types',
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
	id: 'emit.objects',
	label: 'Retrieve all emit objects',
	fn(node: YAMLMap, store) {
		if (Utils.identify.emit(node)) {
			if (!store.emit) store.emit = []
			store.emit.push(node.get('emit'))
		}
	},
}

scripts[id.IF_OBJECTS] = {
	id: 'if.objects',
	label: 'Retrieve all "if" objects',
	fn(node: YAMLMap, store) {
		if (Utils.identify.if(node)) {
			if (!store.if) store.if = []
			store.if.push(node.get('if'))
		}
	},
}

scripts[id.OBJECTS_THAT_CONTAIN_THESE_KEYS] = {
	id: 'objects.that.contain.these.keys',
	label: `Retrieve all objects that contain the specified keys`,
	fn(node, store) {
		const keys = ['contentType']
		const numKeys = keys.length
		if (isYAMLMap(node)) {
			for (let index = 0; index < numKeys; index++) {
				const key = keys[index] || ''
				if (node.has(key)) {
					if (!Array.isArray(store.containedKeys[key])) {
						store.containedKeys[key] = []
					}
					store.containedKeys[key].push(node.toJSON())
				}
			}
		}
	},
}

scripts[id.REFERENCES] = {
	id: 'references',
	label: 'Retrieve all references',
	fn(node: Pair, store) {
		if (Utils.identify.scalar.reference(node)) {
			if (!store.references.includes(node.value)) {
				store.references.push(node.value)
			}
		}
	},
}

scripts[id.RETRIEVE_URLS] = {
	id: 'retrieve.urls',
	label: 'Retrieve all urls/paths',
	fn(node: Pair, store) {
		if (Utils.identify.scalar.url(node)) {
			if (!store.urls.includes(node.value)) store.urls.push(node.value)
		}
	},
}

scripts[id.STYLE_PROPERTIES] = {
	id: 'style.properties',
	label: 'Retrieve all style properties',
	fn(node: Pair, store) {
		if (Utils.identify.paths.style.any(node)) {
			if (isYAMLMap(node.value)) {
				node.value.items.forEach((pair: Pair) => {
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
				;(node as YAMLMap).items.forEach((pair: Pair) => {
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
	})) as NOODLTypesObserver[]
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
				;(node as YAMLMap).items.forEach((pair: Pair) => {
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
	})) as NOODLTypesObserver[]
}

export default scripts
