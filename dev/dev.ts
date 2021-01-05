import { config } from 'dotenv'
config()
import { enablePatches } from 'immer'
import chalk from 'chalk'
import fs from 'fs-extra'
import path from 'path'
import { ActionType, ComponentType } from 'noodl-types'
import { actionTypes, componentTypes } from 'noodl-utils'
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
import Scripts from './scripts'
import createAggregator from '../src/api/createAggregator'
import { identify, isPair, isScalar, isYAMLMap, isYAMLSeq } from './find'
import { Pair, Scalar, YAMLMap, YAMLSeq } from 'yaml/types'
enablePatches()

const aggregator = createAggregator({
	config: 'meet2d',
})

async function loadRemote({ config }) {
	const [rootConfig, appConfig] = await aggregator.init({
		loadPages: {
			includePreloadPages: true,
		},
	})
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

	function traverse(
		cb: (node: Scalar | Pair | YAMLMap | YAMLSeq) => void,
		docsList: yaml.Document[],
	) {
		const walk = (contents: Scalar | Pair | YAMLMap | YAMLSeq) => {
			if (contents instanceof Scalar) {
				cb(contents)
			} else if (contents instanceof Pair) {
				cb(contents)
				walk(contents.value)
			} else if (contents instanceof YAMLMap) {
				cb(contents)
				contents.items.forEach((pair) => walk(pair))
			} else if (contents instanceof YAMLSeq) {
				contents.items.forEach((node) => {
					walk(node)
				})
			}
		}
		const numDocs = docsList.length
		for (let index = 0; index < numDocs; index++) {
			walk(docsList[index].contents)
		}
	}

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
		getActionTypes(data: any) {
			const results = [] as string[]
			traverse((node) => {
				if (isPair(node)) {
					if (node.key.value === 'actionType') {
						if (!results.includes(node.value.value)) {
							results.push(node.value.value)
						}
					}
				}
			}, data)
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

const noodlTypes = scripts['noodl-types']({
	rootDir: getFilePath('packages/noodl-types'),
})

noodlTypes.refreshComponentTypes()

console.log(chalk.green(`noodl-types scripting ended`))
