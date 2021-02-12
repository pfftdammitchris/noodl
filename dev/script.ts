import { config } from 'dotenv'
config()
import { enablePatches } from 'immer'
import fs from 'fs-extra'
import chalk from 'chalk'
import path from 'path'
import createObjectScripts from '../src/api/createObjectScripts'
import scripts, {
	createActionPropComboScripts,
	createComponentPropComboScripts,
	id as scriptId,
	Store,
} from '../src/utils/scripts'
import { getFilepath, loadFiles } from '../src/utils/common'

enablePatches()

const pathToDataFile = getFilepath('data/generated/page-parts.json')
let dataFile = {}

const o = createObjectScripts({
	pathToDataFile,
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

createActionPropComboScripts().forEach((obj) => o.use(obj))
createComponentPropComboScripts().forEach((obj) => o.use(obj))

o.on('start', (store) => {
	try {
		fs.ensureFileSync(pathToDataFile)
		dataFile = JSON.parse(fs.readFileSync(pathToDataFile, 'utf8'))
	} catch (error) {
		console.error(`[${chalk.red(error.name)}]: ${chalk.yellow(error.message)}`)
		fs.writeJsonSync(pathToDataFile, (dataFile = {} as Store), { spaces: 2 })
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
	if (!store.propCombos) store.propCombos = { actions: {}, components: {} }
	if (!store.styles) store.styles = {} as Store['styles']
	if (!store.styles.border) store.styles.border = []
	if (!store.containedKeys) store.containedKeys = {}
})
	.on('end', (store) => {
		store.actionTypes = store.actionTypes.sort().filter(Boolean)
		store.componentTypes = store.componentTypes.sort().filter(Boolean)
		store.componentKeys = store.componentKeys.sort().filter(Boolean)
		store.references = store.references.sort().filter(Boolean)
		store.styleKeys = store.styleKeys.sort().filter(Boolean)
		store.funcNames = store.funcNames.sort().filter(Boolean)
		store.urls = store.urls.sort().filter(Boolean)

		try {
			fs.writeJsonSync(pathToDataFile, store, { spaces: 2 })
		} catch (error) {
			console.error(
				`[${chalk.red(error.name)}]: ${chalk.yellow(error.message)}`,
			)
		}

		const generateFolder = getFilepath('packages/noodl-types/src/generated')
		fs.ensureDirSync(generateFolder)

		// Save as js files for noodl-types to export them for use
		const load = ({ filename }: { filename: string }) => {
			const filepath = path.join(generateFolder, filename)
			if (fs.existsSync(filepath)) return fs.readFileSync(filepath, 'utf8')
		}

		const file = {
			actionTypes: load({ filename: 'actionTypes.ts' }) || '',
			componentTypes: load({ filename: 'componentTypes.ts' }) || '',
			componentKeys: load({ filename: 'componentKeys.ts' }) || '',
			styleKeys: load({ filename: 'styleKeys.ts' }) || '',
		}

		Object.entries(file).forEach(([key, data]) => {
			let itemsStr = data
				.substring(data.indexOf('['), data.indexOf(']') + 1)
				.replace(/\'/g, '"')
				.replace(/(,\n\])/, '\n]')

			let items: string[] = []

			try {
				items = JSON.parse(itemsStr)
			} catch (error) {
				console.error(
					`[${chalk.red(error.name)}]: ${chalk.yellow(error.message)}`,
				)
			}
			items.forEach(
				(o) => o && !store[key]?.includes?.(o) && store[key]?.push(o),
			)
			let fileData =
				`const ${key} = ${JSON.stringify(store[key], null, 2)} as const` +
				'\n\n' +
				`export default ${key}`
			fs.writeFileSync(path.join(generateFolder, `${key}.ts`), fileData, 'utf8')
		})
	})
	.use(scripts[scriptId.COMPONENT_TYPES])
	.run()

console.log(chalk.green(`Scripts ended`))
