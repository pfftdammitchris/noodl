import { config } from 'dotenv'
config()
import { enablePatches } from 'immer'
import fs from 'fs-extra'
import chalk from 'chalk'
import createObjectScripts from '../src/api/createObjectScripts'
import scripts, { id as scriptId, Store } from '../src/utils/scripts'
import { getFilePath, loadFiles } from '../src/utils/common'
enablePatches()

const pathToDataFile = getFilePath('packages/noodl-types/src/data.json')
let dataFile = {}

const o = createObjectScripts({
	pathToDataFile: getFilePath('packages/noodl-types/src/data.json'),
	ymlDocs: loadFiles({
		dir: 'data/generated',
		ext: 'yml',
	}),
})

Object.values({
	actionTypes: scriptId.ACTION_TYPES,
	componentTypes: scriptId.COMPONENT_TYPES,
	componentKeys: scriptId.COMPONENT_KEYS,
	styleKeys: scriptId.STYLE_PROPERTIES,
} as const).forEach((id) => o.use(scripts[id]))

o.on('start', (store) => {
	fs.ensureFileSync(pathToDataFile as string)
	try {
		dataFile = JSON.parse(fs.readFileSync(pathToDataFile as string, 'utf8'))
	} catch (error) {
		fs.writeJsonSync(pathToDataFile as string, (dataFile = {} as Store), {
			spaces: 2,
		})
	}
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
		console.log(store)
		store.actionTypes = store.actionTypes.sort()
		store.componentTypes = store.componentTypes.sort()
		store.componentKeys = store.componentKeys.sort()
		store.references = store.references.sort()
		store.styleKeys = store.styleKeys.sort()
		store.funcNames = store.funcNames.sort()
		store.urls = store.urls.sort()
		fs.writeJsonSync(pathToDataFile, store, { spaces: 2 })
	})
	.use(scripts[scriptId.COMPONENT_TYPES])
	.run()

console.log(chalk.green(`Scripts ended`))
