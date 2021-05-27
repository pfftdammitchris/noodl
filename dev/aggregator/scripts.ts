import * as u from '@jsmanifest/utils'
import { Identify } from 'noodl-types'
import yaml from 'yaml'
import Utils from '../../src/api/Utils'
import { AggregatorStore } from './types'
import * as t from '../../src/api/Scripts/types'

export type ScriptId = keyof typeof scripts

const createScript = (
	fn: (
		store: AggregatorStore,
	) => Omit<ReturnType<t.Script.Register<AggregatorStore>>, 'key'>,
) => fn

const scripts = {
	actionTypes: createScript((store) => ({
		type: 'array',
		label: 'Retrieve all action types',
		fn({ name, node }) {
			if (
				yaml.isPair(node) &&
				yaml.isScalar(node.key) &&
				node.key.value === 'actionType'
			) {
				if (yaml.isScalar(node.value) && u.isStr(node.value.value)) {
					if (!store.actionTypes.includes(node.value.value)) {
						store.actionTypes.push(node.value.value)
					}
				}
			}
		},
	})),
	componentKeys: createScript((store) => ({
		type: 'array',
		label: 'Retrieve all component keys',
		fn({ node }) {
			if (Utils.identify.component.any(node)) {
				node.items.forEach((pair) => {
					if (
						yaml.isScalar(pair.key) &&
						u.isStr(pair.key.value) &&
						!store.componentKeys?.includes(pair.key.value)
					) {
						store.componentKeys.push(pair.key.value)
					}
				})
			}
		},
	})),
	componentTypes: createScript((store) => ({
		type: 'array',
		label: 'Retrieve all component types',
		fn({ name, node }) {
			if (Utils.identify.component.any(node)) {
				const value = node.get('type') as string
				if (!store.componentTypes.includes(value)) {
					store.componentTypes.push(value)
				}
			}
		},
	})),
	contentTypes: createScript((store) => ({
		type: 'array',
		label: 'Retrieve all contentTypes',
		fn({ node }) {
			if (
				yaml.isPair(node) &&
				yaml.isScalar(node.key) &&
				node.key.value === 'contentType'
			) {
				if (yaml.isScalar(node.value) && u.isStr(node.value.value)) {
					if (!store.contentTypes.includes(node.value.value)) {
						store.contentTypes.push(node.value.value)
					}
				}
			}
		},
	})),
	funcNames: createScript((store) => ({
		type: 'array',
		label: 'Retrieve all builtIn action funcNames',
		fn({ node }) {
			if (yaml.isPair(node) && Utils.identify.keyValue.funcName(node)) {
				if (yaml.isScalar(node.value) && u.isStr(node.value.value)) {
					if (!store.funcNames?.includes(node.value.value)) {
						store.funcNames.push(node.value.value)
					}
				}
			}
		},
	})),
	gotoObjects: createScript((store) => ({
		type: 'array',
		label: 'Retrieve all goto objects',
		fn({ node }) {
			if (yaml.isMap(node)) {
				if (
					node.has('goto') ||
					node.has('destination') ||
					node.hasIn(['dataIn', 'destination'])
				) {
					store.gotoObjects.push(node)
				}
			}
		},
	})),
	references: createScript((store) => ({
		type: 'array',
		label: 'References',
		fn({ node }) {
			if (yaml.isScalar(node)) {
				if (Identify.reference(node.value)) {
					store.references.push(node.value)
				}
			}
		},
	})),
	viewTags: createScript((store) => ({
		type: 'array',
		label: 'Retrieve all viewTags',
		fn({ node }) {
			if (
				yaml.isPair(node) &&
				yaml.isScalar(node.key) &&
				node.key.value === 'viewTag'
			) {
				if (yaml.isScalar(node.value) && u.isStr(node.value.value)) {
					if (!store.viewTags.includes(node.value.value)) {
						store.viewTags.push(node.value.value)
					}
				}
			}
		},
	})),
	urls: createScript((store) => ({
		type: 'array',
		label: 'Retrieve all urls/paths',
		fn({ name, node }) {
			if (Utils.identify.scalar.url(node) && u.isStr(node.value)) {
				if (!store.urls.includes(node.value)) {
					store.urls.push(node.value)
				}
			}
		},
	})),
}

export const scriptKeys = u.keys(scripts)

export default u.reduce(
	u.entries(scripts),
	(acc, [key, registerScript]) => {
		acc[key] = (store) => ({ ...registerScript(store), key })
		return acc
	},
	{} as Record<ScriptId, t.Script.Register<AggregatorStore>>,
)
