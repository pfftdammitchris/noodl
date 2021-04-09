import { config } from 'dotenv'
config()
import { enablePatches } from 'immer'
import fs from 'fs-extra'
import chalk from 'chalk'
import Scripts from '../src/api/createObjectScripts'
import scripts, {
	createActionPropComboScripts,
	createComponentPropComboScripts,
	id as scriptId,
	Store,
} from '../src/utils/scripts'
import * as u from '../src/utils/common'

enablePatches()

let dataFilePath = 'data/generated/metadata.json'
let dataFile = {}

const o = new Scripts({
	dataFilePath,
	docs: u.loadFiles({
		dir: `output/server`,
		ext: 'yml',
	}),
})

u.values({
	actionTypes: scriptId.ACTION_TYPES,
	componentTypes: scriptId.COMPONENT_TYPES,
	componentKeys: scriptId.COMPONENT_KEYS,
	styleKeys: scriptId.STYLE_PROPERTIES,
} as const).forEach((id) => o.use(scripts[id]))

o.use({
	script: [
		scripts[scriptId.COMPONENT_TYPES],
		...createActionPropComboScripts(),
		...createComponentPropComboScripts(),
	],
	start(store) {
		try {
			fs.ensureFileSync(dataFilePath)
			dataFile = JSON.parse(fs.readFileSync(dataFilePath, 'utf8'))
		} catch (error) {
			console.error(
				`[${chalk.red(error.name)}]: ${chalk.yellow(error.message)}`,
			)
			fs.writeJsonSync(dataFilePath, (dataFile = {} as Store), { spaces: 2 })
		}
		// Temp do a fresh start everytime for now
		u.keys(store).forEach((key) => delete store[key])
		if (!u.isArr(store.actionTypes)) store.actionTypes = []
		if (!u.isArr(store.componentTypes)) store.componentTypes = []
		if (!u.isArr(store.componentKeys)) store.componentKeys = []
		if (!u.isArr(store.references)) store.references = []
		if (!u.isArr(store.styleKeys)) store.styleKeys = []
		if (!u.isArr(store.urls)) store.urls = []
		if (!store.actions) store.actions = {}
		if (!store.components) store.components = {}
		if (!store.emit) store.emit = []
		if (!store.funcNames) store.funcNames = []
		if (!store.propCombos) store.propCombos = { actions: {}, components: {} }
		if (!store.styles) store.styles = {} as Store['styles']
		if (!store.styles.border) store.styles.border = []
		if (!store.containedKeys) store.containedKeys = {}
	},
	end(store) {
		store.actionTypes = store.actionTypes.sort().filter(Boolean)
		store.componentTypes = store.componentTypes.sort().filter(Boolean)
		store.componentKeys = store.componentKeys.sort().filter(Boolean)
		store.references = store.references.sort().filter(Boolean)
		store.styleKeys = store.styleKeys.sort().filter(Boolean)
		store.funcNames = store.funcNames.sort().filter(Boolean)
		store.urls = store.urls.sort().filter(Boolean)

		try {
			fs.writeJsonSync(dataFilePath, store, { spaces: 2 })
		} catch (error) {
			console.error(
				`[${chalk.red(error.name)}]: ${chalk.yellow(error.message)}`,
			)
		}

		// const generateFolder = getFilepath('packages/noodl-types/src/generated')
		// const generateFolder = getFilepath('data/generated')
		// fs.ensureDirSync(generateFolder)

		// // Save as js files for noodl-types to export them for use
		// const load = ({ filename }: { filename: string }) => {
		// 	const filepath = path.join(generateFolder, filename)
		// 	if (fs.existsSync(filepath)) return fs.readFileSync(filepath, 'utf8')
		// }

		// const file = {
		// 	actionTypes: load({ filename: 'actionTypes.ts' }) || '',
		// 	componentTypes: load({ filename: 'componentTypes.ts' }) || '',
		// 	componentKeys: load({ filename: 'componentKeys.ts' }) || '',
		// 	styleKeys: load({ filename: 'styleKeys.ts' }) || '',
		// }

		// entries(file).forEach(([key, data]) => {
		// 	let itemsStr = data
		// 		.substring(data.indexOf('['), data.indexOf(']') + 1)
		// 		.replace(/\'/g, '"')
		// 		.replace(/(,\n\])/, '\n]')

		// 	let items: string[] = []

		// 	try {
		// 		items = JSON.parse(itemsStr)
		// 	} catch (error) {
		// 		console.error(
		// 			`[${chalk.red(error.name)}]: ${chalk.yellow(error.message)}`,
		// 		)
		// 	}
		// 	items.forEach(
		// 		(o) => o && !store[key]?.includes?.(o) && store[key]?.push(o),
		// 	)
		// 	let fileData =
		// 		`const ${key} = ${JSON.stringify(store[key], null, 2)} as const` +
		// 		'\n\n' +
		// 		`export default ${key}`
		// 	fs.writeFileSync(path.join(generateFolder, `${key}.ts`), fileData, 'utf8')
		// })
	},
}).run()

console.log(u.brightGreen(`\nScripts ended\n`))
