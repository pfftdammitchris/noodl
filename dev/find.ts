import { config } from 'dotenv'
config()
import axios from 'axios'
import produce, { applyPatches, enablePatches } from 'immer'
import chalk from 'chalk'
import fs from 'fs-extra'
import path from 'path'
import { ActionType, ComponentType, identify } from 'noodl-types'
import globby from 'globby'
import isPlainObject from 'lodash/isPlainObject'
import { forEachDeepKeyValue, getFilePath } from '../src/utils/common'
import createAggregator from '../src/api/createAggregator'
import { AnyFn } from '../src/types'
import { getLogoutPageObject } from './helpers'
import * as T from './types'
enablePatches()

const format = (function () {
	function basic(...fns) {
		return function basicFormat(data) {
			return fns.reduceRight((acc, fn) => acc(fn(data)), [])
		}
	}

	const o = {
		list(type: 'basic') {
			switch (type) {
				case 'basic':
					return basic
			}
		},
	}
	return o
})()

const Find = (function () {
	let transformers = []
	let mods = []
	let formats = []

	const o = {
		forEachDeepKeyValue<O = any>(
			cb: (key: string, value: any, obj: T.PlainObject) => void,
			obj: O | O[],
		) {
			if (Array.isArray(obj)) {
				obj.forEach((v) => o.forEachDeepKeyValue(cb, v))
			} else if (isPlainObject(obj)) {
				Object.entries(obj).forEach(([key, value]) => {
					cb(key, value, obj)
					if (isPlainObject(value) || Array.isArray(value)) {
						o.forEachDeepKeyValue(cb, value)
					}
				})
			} else {
			}
		},
	}
	return o
})()

const perf = (fn: Function) => {
	console.time('perfing')
	fn()
	console.timeEnd('perfing')
}
const results = []

perf(() => {
	Find.forEachDeepKeyValue((key) => {
		console.log(key)
		results.push(key)
	}, getLogoutPageObject())
})

// perf(() => {
// 	forEachDeepKeyValue((key) => {
// 		console.log(key)
// 		results.push(key)
// 	}, getLogoutPageObject())
// })

// fs.writeJsonSync(getFilePath('./hehe.json'), results, { spaces: 2 })
// globby(getFilePath('data/generated/json/**/*.json')).then(async (filepaths) => {
// 	const objects = await Promise.all(
// 		filepaths.map((filepath) => fs.readJsonSync(filepath)),
//   )

// })

export default Find
