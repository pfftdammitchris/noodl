import fs from 'fs-extra'
import path from 'path'
import yaml from 'yaml'
import globby from 'globby'
import Scripts from '../src/api/Scripts'
import scriptIds from '../src/utils/scripts'
import * as u from '../src/utils/common'

const pathToYmlFiles = path.resolve(
	path.join(__dirname, '../output/server'),
	`**/*.yml`,
)

const scripts = new Scripts({
	dataFilePath: path.resolve(
		path.join(__dirname, '../data/generated/metadata.json'),
	),
	docs: globby
		.sync(pathToYmlFiles)
		.map((filepath) =>
			yaml.parseDocument(fs.readFileSync(filepath, { encoding: 'utf-8' })),
		),
})

scripts.use({
	script: [scriptIds.REFERENCES],
	start(store) {
		store.references = []
	},
	end(store) {
		console.log(store)
	},
})

scripts.run()
