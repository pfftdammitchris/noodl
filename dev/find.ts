console.clear()
import { config } from 'dotenv'
config()
import axios from 'axios'
import produce, { applyPatches, enablePatches } from 'immer'
import chalk from 'chalk'
import fs from 'fs-extra'
import path from 'path'
import globby from 'globby'
import isPlainObject from 'lodash/isPlainObject'
import createAggregator from '../src/api/createAggregator'
import { ActionType, ComponentType, identify } from 'noodl-types'
import {
	forEachDeepKeyValue,
	getFilePath,
	sortObjPropsByKeys,
} from '../src/utils/common'
import { AnyFn } from '../src/types'
import { getLogoutPageObject } from './helpers'
import * as T from './types'
enablePatches()

const Find = (function () {
	const o = {
		objectsThatContainKeys({
			name = '',
			keys,
			objs,
		}: {
			name?: string
			keys: string | string[]
			objs: any
		}) {
			const keywords = Array.isArray(keys) ? keys : [keys]
			const results = {
				name,
				keywords,
				results: keywords.reduce(
					(acc, keyword) => Object.assign(acc, { [keyword]: [] }),
					{},
				),
			}
			forEachDeepKeyValue(
				(key, value, obj) =>
					keywords.includes(key) && results.results[key].push(obj),
				objs,
			)
			return results
		},
		getKeyCounts({
			keys,
			objs,
		}: {
			objs: any
			keys?: string | string[]
		}): { [key: string]: number } {
			const keywords = Array.isArray(keys) ? keys : (keys && [keys]) || []
			const results = {} as { [key: string]: number }
			forEachDeepKeyValue((key, value, obj) => {
				if (keywords.length) {
					if (keywords.includes(key)) {
						if (typeof results[key] !== 'number') results[key] = 0
						results[key]++
					}
				} else {
					if (typeof results[key] !== 'number') results[key] = 0
					results[key]++
				}
			}, objs)
			return sortObjPropsByKeys(results)
		},
		getPathnames({ name = '', objs }: { name?: string; objs: any }) {
			const results = {
				name,
				results: [],
			}
			forEachDeepKeyValue((key, value, obj) => {
				if (typeof value === 'string') {
					if (value.startsWith('http')) {
						!results.results.includes(value) && results.results.push(value)
					} else if (/(path|resource)/i.test(key)) {
						!results.results.includes(value) && results.results.push(value)
					}
				}
			}, objs)
			return results.results.sort()
		},
	}

	return o
})()

// const objsThatContainKeys = Find.objectsThatContainKeys({
// 	name: 'Logout',
// 	keys: 'path',
// 	objs: getLogoutPageObject(),
// })

// const keyCounts = Find.getKeyCounts({
// 	objs: [],
// })

const getPathnames = Find.getPathnames({
	objs: getLogoutPageObject(),
})

console.log(getPathnames)

fs.writeJsonSync(getFilePath('./hehe.json'), getPathnames, { spaces: 2 })
// globby(getFilePath('data/generated/json/**/*.json')).then(async (filepaths) => {
// 	const objects = await Promise.all(
// 		filepaths.map((filepath) => fs.readJsonSync(filepath)),
//   )

// })

export default Find
