import { config } from 'dotenv'
config()
import { enablePatches } from 'immer'
import chalk from 'chalk'
import createObjectScripts from '../src/api/createObjectScripts'
import scripts, { id as scriptId, Store } from '../src/utils/scripts'
import { getFilePath, loadFiles } from '../src/utils/common'
enablePatches()

const o = createObjectScripts({
	pathToDataFile: getFilePath('packages/noodl-types/src/data.json'),
	ymlDocs: loadFiles({
		dir: 'data/generated',
		ext: 'yml',
	}),
})

Object.values(scriptId).forEach((id) => o.use(scripts[id]))

o.on('start', (store) => {
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
		scripts: [scriptId.ACTION_TYPES, scriptId.ACTION_OBJECTS],
	})

console.log(chalk.green(`Scripts ended`))
