import * as u from '@jsmanifest/utils'
import * as ts from 'ts-morph'
import * as com from 'noodl-common'
import prettier from 'prettier'
import yaml from 'yaml'
import fs from 'fs-extra'
import Aggregator from '../../src/api/Aggregator'
import actions from './actions'
import components from './components'
import * as util from './utils'

const paths = {
	docs: com.getAbsFilePath('generated'),
	assets: com.getAbsFilePath('data/generated/assets.json'),
	metadata: com.getAbsFilePath('data/generated/metadata.json'),
	typings: com.getAbsFilePath('data/generated/typings.d.ts'),
	actionTypes: com.getAbsFilePath('data/generated/actionTypes.d.ts'),
	componentTypes: com.getAbsFilePath('data/generated/componentTypes.d.ts'),
}

for (const [key, filepath] of u.entries(paths)) {
	paths[key] = com.normalizePath(filepath)
}

fs.existsSync(paths.actionTypes) && fs.removeSync(paths.actionTypes)
fs.existsSync(paths.componentTypes) && fs.removeSync(paths.componentTypes)

const generator = (function () {
	const o = {
		//
	}

	return o
})()

export default generator
