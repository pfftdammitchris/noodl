import { config } from 'dotenv'
config()
import { enablePatches } from 'immer'
import chalk from 'chalk'
import fs from 'fs-extra'
import path from 'path'
import { ComponentType } from 'noodl-types'
import { componentTypes } from 'noodl-utils'
import yaml from 'yaml'
import globby from 'globby'
import isPlainObject from 'lodash/isPlainObject'
import * as t from 'typescript-validators'
import {
	entriesDeepKeyValue,
	forEachDeepKeyValue,
	getFilePath,
	sortObjPropsByKeys,
} from '../src/utils/common'
import createAggregator from '../src/api/createAggregator'
import { createObjectUtils } from './dev'
import { identify as ID } from './find'
enablePatches()

function Scripts() {
	const utils = {} as ReturnType<typeof createObjectUtils> & {
		identify: typeof ID
	}

	const o = {
		'noodl-types'({ rootDir }: { rootDir: string }) {
			const pathToDataFile = path.join(rootDir, 'src/data.json')
			let dataFile: any

			fs.ensureFileSync(pathToDataFile)
			dataFile = fs.readFileSync(pathToDataFile, 'utf8')

			try {
				dataFile = JSON.parse(dataFile) || {}
			} catch (error) {
				fs.writeJsonSync(pathToDataFile, (dataFile = {}), { spaces: 2 })
			}

			function save() {
				fs.writeJsonSync(pathToDataFile, dataFile, { spaces: 2 })
			}

			const noodlTypes = {
				refreshActionTypes() {
					const results = utils.getActionTypes(utils.data())
					if (!dataFile.actionTypes) dataFile.actionTypes = []
					if (Array.isArray(results) && results.length) {
						results.forEach((key) => {
							if (!dataFile.actionTypes.includes(key)) {
								dataFile.actionTypes.push(key)
							}
						})
					}
					save()
					return noodlTypes
				},
				refreshComponentKeys() {
					const results = utils.getAllComponentKeys(utils.data())
					if (!dataFile.componentKeys) dataFile.componentKeys = []
					if (Array.isArray(results) && results.length) {
						results.forEach((key) => {
							if (!dataFile.componentKeys.includes(key)) {
								dataFile.componentKeys.push(key)
							}
						})
					}
					save()
					return noodlTypes
				},
				refreshComponentTypes() {
					const results = utils.getComponentTypes(utils.data())
					if (!dataFile.componentTypes) dataFile.componentTypes = []
					if (Array.isArray(results) && results.length) {
						results.forEach((key) => {
							if (!dataFile.componentTypes.includes(key)) {
								dataFile.componentTypes.push(key)
							}
						})
					}
					save()
					return noodlTypes
				},
			}

			return noodlTypes
		},
		use(mod: ReturnType<typeof createObjectUtils> | typeof ID) {
			if ('id' in mod) {
				if (mod.id === 'object.utils') {
					Object.assign(utils, mod)
				} else if (mod.id === 'identify') {
					utils.identify = mod as typeof ID
				}
			}
			return o
		},
	}

	return o
}

export default Scripts
