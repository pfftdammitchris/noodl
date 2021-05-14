import * as u from '@jsmanifest/utils'
import {
	ActionObject,
	ComponentObject,
	EmitObjectFold,
	IfObject,
	StyleBorderObject,
} from 'noodl-types'
import invariant from 'invariant'
import fs from 'fs-extra'
import path from 'path'
import yaml from 'yaml'
import globby from 'globby'
import Scripts from '../src/api/Scripts'
import scriptIds from '../src/utils/scripts'
import { cyan, brightGreen, lightGreen, withTag } from '../src/utils/common'

export interface Store {
	actions: Partial<Record<string, ActionObject[]>>
	actionTypes: string[]
	components: Partial<Record<string, ComponentObject[]>>
	componentKeys: string[]
	componentTypes: string[]
	emit: EmitObjectFold[]
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
			[actionType: string]: { [key: string]: any[] }
		}
		components: {
			[componentType: string]: { [key: string]: any[] }
		}
	}
	containedKeys: {
		[keyword: string]: any[]
	}
}

const tag = withTag()

const pathToYmlFiles = path.resolve(
	path.join(__dirname, '../output/server'),
	`**/*.yml`,
)

const scripts = new Scripts<Store>({
	dataFilePath: path.resolve(
		path.join(__dirname, '../data/generated/metadata.json'),
	),
	docs: globby
		.sync(pathToYmlFiles)
		.map((filepath) =>
			yaml.parseDocument(fs.readFileSync(filepath, { encoding: 'utf8' })),
		),
})

scripts
	.use({
		script: [scriptIds.ACTION_TYPES, scriptIds.REFERENCES],
		onStart(store) {
			store.actions
			store.references = []s
		},
		onEnd(store) {
			u.log(`${tag('onEnd')} store`, store)
			u.log(`${u.withTag(`End`, lightGreen)} script`)
		},
	})
	.run()
