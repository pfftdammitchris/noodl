import { config } from 'dotenv'
config()
import {
	ActionObject,
	ActionType,
	ComponentObject,
	ComponentType,
	EmitObject,
	IfObject,
	StyleBorderObject,
} from 'noodl-types'
import { enablePatches } from 'immer'
import chalk from 'chalk'
import fs from 'fs-extra'
import path from 'path'
import { Pair } from 'yaml/types'
import yaml from 'yaml'
import globby from 'globby'
import { getFilePath, isYAMLMap } from '../src/utils/common'
import createObjectScripts from '../src/api/createObjectScripts'
import Utils from '../src/api/Utils'
enablePatches()

interface Store {
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

function loadFiles(opts: { dir: string; ext: 'yml' }): yaml.Document[]
function loadFiles(opts: { dir: string; ext: 'json' }): { [key: string]: any }[]
function loadFiles({
	dir,
	ext = 'json',
}: {
	dir: string
	ext?: 'json' | 'yml'
}): any[] {
	const files = globby.sync(path.resolve(getFilePath(dir), `**/*.${ext}`))
	return files.reduce(
		(acc, filepath) =>
			acc.concat(
				ext === 'json'
					? fs.readJsonSync(filepath)
					: yaml.parseDocument(fs.readFileSync(filepath, 'utf8')),
			),
		[],
	)
}

const o = createObjectScripts(
	loadFiles({
		dir: 'data/generated',
		ext: 'yml',
	}),
)

const noodlTypes = o['noodl-types']<Store>({
	pathToDataFile: getFilePath('packages/noodl-types/src/data.json'),
})

noodlTypes
	.use({
		id: 'action.types',
		label: 'Retrieve all action types',
		fn(node, store) {
			if (Utils.identify.keyValue.actionType(node)) {
				if (!store.actionTypes.includes(node.value.value)) {
					store.actionTypes.push(node.value.value)
				}
			}
		},
	})
	.use({
		id: 'component.types',
		label: 'Retrieve all component types',
		fn(node, store) {
			if (Utils.identify.component.any(node)) {
				if (!store.componentTypes.includes(node.get('type'))) {
					store.componentTypes.push(node.get('type'))
				}
			}
		},
	})
	.use({
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
	})
	.use({
		id: 'builtIn.funcNames',
		label: 'Retrieve all builtIn action funcNames',
		fn(node, store) {
			if (Utils.identify.keyValue.funcName(node)) {
				if (!store.funcNames.includes(node.value.value)) {
					store.funcNames.push(node.value.value)
				}
			}
		},
	})
	.use({
		id: 'references',
		label: 'Retrieve all references',
		fn(node, store) {
			if (Utils.identify.scalar.reference(node)) {
				if (!store.references.includes(node.value)) {
					store.references.push(node.value)
				}
			}
		},
	})
	.use({
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
	})
	.use({
		id: 'action.objects',
		label: 'Retrieve all action objects',
		fn(node, store) {
			if (Utils.identify.action.any(node)) {
				const actionType = node.get('actionType')
				if (!store.actions[actionType]) store.actions[actionType] = []
				store.actions[actionType].push(node.toJSON())
			}
		},
	})
	.use({
		id: 'border.style.objects',
		label: 'Retrieve all style border objects',
		fn(node, store) {
			if (Utils.identify.style.border(node)) {
				if (!store.styles.border) store.styles.border = []
				store.styles.border.push(node)
			}
		},
	})
	.use({
		id: 'emit.objects',
		label: 'Retrieve all emit objects',
		fn(node, store) {
			if (Utils.identify.emit(node)) {
				if (!store.emit) store.emit = []
				store.emit.push(node.get('emit'))
			}
		},
	})
	.use({
		id: 'if.objects',
		label: 'Retrieve all "if" objects',
		fn(node, store) {
			if (Utils.identify.if(node)) {
				if (!store.if) store.if = []
				store.if.push(node.get('if'))
			}
		},
	})
	.use({
		id: 'component.objects',
		label: 'Retrieve all component objects',
		fn(node, store) {
			if (Utils.identify.component.any(node)) {
				const componentType = node.get('type')
				if (!store.components[componentType])
					store.components[componentType] = []
				store.components[componentType].push(node.toJSON())
			}
		},
	})
	.use({
		id: 'retrieve.urls',
		label: 'Retrieve all urls/paths',
		fn(node, store) {
			if (Utils.identify.scalar.url(node)) {
				if (!store.urls.includes(node.value)) store.urls.push(node.value)
			}
		},
	})
	.use({
		id: 'objects.that.contain.these.keys',
		label: `Retrieve all objects that contain the specified keys`,
		fn(node, store) {
			const keys = ['contentType']
			const numKeys = keys.length
			if (isYAMLMap(node)) {
				for (let index = 0; index < numKeys; index++) {
					const key = keys[index]
					if (node.has(key)) {
						if (!Array.isArray(store.containedKeys[key])) {
							store.containedKeys[key] = []
						}
						store.containedKeys[key].push(node.toJSON())
					}
				}
			}
		},
	})

noodlTypes
	.on('start', (store) => {
		// Temp do a fresh start everytime for now
		Object.keys(store).forEach((key) => delete store[key])
		if (!Array.isArray(store.actionTypes)) store.actionTypes = []
		if (!Array.isArray(store.componentTypes)) store.componentTypes = []
		if (!Array.isArray(store.componentKeys)) store.componentKeys = []
		if (!Array.isArray(store.references)) store.references = []
		if (!Array.isArray(store.styleKeys)) store.styleKeys = []
		if (!Array.isArray(store.urls)) store.urls = []
		if (!store.actions) store.actions = {}
		if (!store.components) store.components = {}
		if (!store.emit) store.emit = []
		if (!store.funcNames) store.funcNames = []
		if (!store.styles) store.styles = {} as Store['styles']
		if (!store.styles.border) store.styles.border = []
		if (!store.containedKeys) store.containedKeys = {}
	})
	.on('end', (store) => {
		store.actionTypes = store.actionTypes.sort()
		store.componentTypes = store.componentTypes.sort()
		store.componentKeys = store.componentKeys.sort()
		store.references = store.references.sort()
		store.styleKeys = store.styleKeys.sort()
		store.funcNames = store.funcNames.sort()
		store.urls = store.urls.sort()
	})
	.run({
		scripts: ['action.types', 'component.types'],
	})

console.log(chalk.green(`noodl-types scripting ended`))
