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
import { Pair, Scalar, YAMLMap, YAMLSeq } from 'yaml/types'
import { componentTypes } from 'noodl-utils'
import yaml from 'yaml'
import globby from 'globby'
import {
	forEachDeepKeyValue,
	getFilePath,
	isPair,
	isYAMLMap,
	sortObjPropsByKeys,
	traverse,
} from '../src/utils/common'
import Scripts from './scripts'
import { identify } from './find'
import { YAMLNode } from './types'
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

export const createObjectUtils = function (
	ymlDocs: yaml.Document | yaml.Document[],
) {
	const docs = Array.isArray(ymlDocs) ? ymlDocs : [ymlDocs]

	const o = {
		id: 'object.utils',
		data() {
			return docs
		},
		getObjectsThatContainKeys(keys: string | string[], data: any): any[] {
			const keywords = Array.isArray(keys) ? keys : [keys]
			const results = []
			forEachDeepKeyValue(
				(key, value, obj) => keywords.includes(key) && results.push(obj),
				Array.isArray(data) ? data : [data],
			)
			return results
		},
		getKeyCounts(keys: string | string[], data: any): Record<string, number> {
			const keywords = Array.isArray(keys) ? keys : (keys && [keys]) || []
			const results = {} as { [key: string]: number }
			forEachDeepKeyValue(
				(key, value, obj) => {
					if (keywords.length) {
						if (keywords.includes(key)) {
							if (typeof results[key] !== 'number') results[key] = 0
							results[key]++
						}
					} else {
						if (typeof results[key] !== 'number') results[key] = 0
						results[key]++
					}
				},
				Array.isArray(data) ? data : [data],
			)
			return sortObjPropsByKeys(results)
		},
		getPaths(data: any) {
			const results = [] as string[]
			forEachDeepKeyValue(
				(key, value, obj) => {
					if (typeof value === 'string') {
						if (value.startsWith('http')) {
							!results.includes(value) && results.push(value)
						} else if (/(path|resource)/i.test(key)) {
							!results.includes(value) && results.push(value)
						}
					}
				},
				Array.isArray(data) ? data : [data],
			)
			return results.sort()
		},
		getActionTypes(docs: yaml.Document | yaml.Document[]) {
			const results = [] as string[]
			traverse((node) => {
				if (isPair(node)) {
					if (node.key.value === 'actionType') {
						if (!results.includes(node.value.value)) {
							results.push(node.value.value)
						}
					}
				}
			}, docs)
			return results.sort()
		},
		getAllComponentKeys(data: any) {
			const results = [] as string[]
			traverse((node) => {
				if (identify.component.any(node)) {
					node.items.forEach((pair) => {
						if (!results.includes(pair.key.value)) {
							results.push(pair.key.value)
						}
					})
				}
			}, data)
			return results.sort()
		},
		// !NOTE - This is useless. make a dynamic way
		getComponentTypes(data: any) {
			const results = [] as string[]
			traverse((node) => {
				if (isPair(node)) {
					if (
						node.key.value === 'type' &&
						typeof node.value.value === 'string' &&
						componentTypes.includes(node.value.value)
					) {
						if (!results.includes(node.value.value)) {
							results.push(node.value.value)
						}
					}
				}
			}, data)
			return results.sort()
		},
	}

	return o
}

const o = createObjectUtils(
	loadFiles({
		dir: 'data/generated',
		ext: 'yml',
	}),
)

const scripts = Scripts()
scripts.use(o)
scripts.use(identify)

const noodlTypes = scripts['noodl-types']<Store>({
	rootDir: getFilePath('packages/noodl-types'),
})

function createNodeHandler(fn: (node: YAMLNode, store: Store) => void) {
	return (node: YAMLNode, store: Store) => {
		return fn(node, store)
	}
}

const handleActionType = createNodeHandler((node, store) => {
	if (identify.keyValue.actionType(node)) {
		if (!store.actionTypes.includes(node.value.value)) {
			store.actionTypes.push(node.value.value)
		}
	}
})

const handleComponentType = createNodeHandler((node, store) => {
	if (identify.component.any(node)) {
		if (!store.componentTypes.includes(node.get('type'))) {
			store.componentTypes.push(node.get('type'))
		}
	}
})

const handleComponentKeys = createNodeHandler((node, store) => {
	if (identify.component.any(node)) {
		node.items.forEach((pair) => {
			if (!store.componentKeys.includes(pair.key.value)) {
				store.componentKeys.push(pair.key.value)
			}
		})
	}
})

const handleFuncNames = createNodeHandler((node, store) => {
	if (identify.keyValue.funcName(node)) {
		if (!store.funcNames.includes(node.value.value)) {
			store.funcNames.push(node.value.value)
		}
	}
})

const handleReferences = createNodeHandler((node, store) => {
	if (identify.scalar.reference(node)) {
		if (!store.references.includes(node.value)) {
			store.references.push(node.value)
		}
	}
})

const handleStyleKeys = createNodeHandler((node, store) => {
	if (identify.paths.style.any(node)) {
		if (isYAMLMap(node.value)) {
			node.value.items.forEach((pair: Pair) => {
				if (pair.key?.value && !identify.scalar.reference(pair.key)) {
					if (!store.styleKeys.includes(pair.key.value)) {
						store.styleKeys.push(pair.key.value)
					}
				}
			})
		}
	}
})

const handleActionObjects = createNodeHandler((node, store) => {
	if (identify.action.any(node)) {
		const actionType = node.get('actionType')
		if (!store.actions[actionType]) store.actions[actionType] = []
		store.actions[actionType].push(node.toJSON())
	}
})

const handleBorderObjects = createNodeHandler((node, store) => {
	if (identify.style.border(node)) {
		if (!store.styles.border) store.styles.border = []
		store.styles.border.push(node)
	}
})

const handleEmitObjects = createNodeHandler((node, store) => {
	if (identify.emit(node)) {
		if (!store.emit) store.emit = []
		store.emit.push(node.get('emit'))
	}
})

const handleIfObjects = createNodeHandler((node, store) => {
	if (identify.if(node)) {
		if (!store.if) store.if = []
		store.if.push(node.get('if'))
	}
})

const handleComponentObjects = createNodeHandler((node, store) => {
	if (identify.component.any(node)) {
		const componentType = node.get('type')
		if (!store.components[componentType]) store.components[componentType] = []
		store.components[componentType].push(node.toJSON())
	}
})

const handleUrls = createNodeHandler((node, store) => {
	if (identify.scalar.url(node)) {
		if (!store.urls.includes(node.value)) store.urls.push(node.value)
	}
})

const handleObjectsThatContainTheseKeys = (keys: string | string[]) => {
	keys = Array.isArray(keys) ? keys : [keys]
	const numKeys = keys.length
	return createNodeHandler((node, store) => {
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
	})
}

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
	.run(
		// handleActionType,
		// handleComponentType,
		// handleComponentKeys,
		// handleEmitObjects,
		// handleIfObjects,
		// handleFuncNames,
		// handleObjectsThatContainTheseKeys(['contentType']),
		// handleReferences,
		// handleStyleKeys,
		handleUrls,
		// handleActionObjects,
		// handleComponentObjects,
		// handleBorderObjects,
	)

console.log(chalk.green(`noodl-types scripting ended`))
