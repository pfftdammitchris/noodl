import {
	ActionObject,
	ActionType,
	ComponentObject,
	ComponentType,
	EmitObject,
	IfObject,
	StyleBorderObject,
} from 'noodl-types'
import { Pair } from 'yaml/types'
import { NOODLTypesObserver } from '../api/createObjectScripts'
import Utils from '../api/Utils'
import { isYAMLMap } from './common'

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
	containedKeys: {
		[keyword: string]: any[]
	}
}

const scripts = {} as { [K in typeof id[keyof typeof id]]: NOODLTypesObserver }

scripts[id.ACTION_OBJECTS] = {
	id: 'action.objects',
	label: 'Retrieve all action objects',
	fn(node, store) {
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
	fn(node, store) {
		if (Utils.identify.keyValue.actionType(node)) {
			if (!store.actionTypes.includes(node.value.value)) {
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
	fn(node, store) {
		if (Utils.identify.keyValue.funcName(node)) {
			if (!store.funcNames.includes(node.value.value)) {
				store.funcNames.push(node.value.value)
			}
		}
	},
}

scripts[id.COMPONENT_KEYS] = {
	id: 'component.keys',
	label: 'Retrieve all component keys',
	fn(node, store) {
		if (Utils.identify.component.any(node)) {
			node.items.forEach((pair) => {
				if (!store.componentKeys.includes(pair.key.value)) {
					store.componentKeys.push(pair.key.value)
				}
			})
		}
	},
}

scripts[id.COMPONENT_OBJECTS] = {
	id: 'component.objects',
	label: 'Retrieve all component objects',
	fn(node, store) {
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
	fn(node, store) {
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
	fn(node, store) {
		if (Utils.identify.emit(node)) {
			if (!store.emit) store.emit = []
			store.emit.push(node.get('emit'))
		}
	},
}

scripts[id.IF_OBJECTS] = {
	id: 'if.objects',
	label: 'Retrieve all "if" objects',
	fn(node, store) {
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
	fn(node, store) {
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
	fn(node, store) {
		if (Utils.identify.scalar.url(node)) {
			if (!store.urls.includes(node.value)) store.urls.push(node.value)
		}
	},
}

scripts[id.STYLE_PROPERTIES] = {
	id: 'style.properties',
	label: 'Retrieve all style properties',
	fn(node, store) {
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

export default scripts
