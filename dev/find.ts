console.clear()
import { config } from 'dotenv'
config()
import axios from 'axios'
import produce, { applyPatches, enablePatches } from 'immer'
import chalk from 'chalk'
import partialRight from 'lodash/partialRight'
import yaml from 'yaml'
import fs from 'fs-extra'
import { Pair, Scalar, YAMLMap, YAMLSeq } from 'yaml/types'
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

// console.log(getPathnames)

fs.writeJsonSync(getFilePath('./hehe.json'), getPathnames, { spaces: 2 })
// globby(getFilePath('data/generated/json/**/*.json')).then(async (filepaths) => {
// 	const objects = await Promise.all(
// 		filepaths.map((filepath) => fs.readJsonSync(filepath)),
//   )

// })

const yml = fs.readFileSync(
	getFilePath('data/generated/yml/Logout.yml'),
	'utf8',
)

const doc = yaml.parseDocument(yml)
const contents = doc.contents as YAMLMap

function traverse(
	cb: (node: Scalar | Pair | YAMLMap | YAMLSeq) => void,
	value: Scalar | Pair | YAMLMap | YAMLSeq,
) {
	if (value instanceof Scalar) {
		cb(value)
	} else if (value instanceof Pair) {
		cb(value)
		traverse(cb, value.value)
	} else if (value instanceof YAMLMap) {
		cb(value)
		value.items.forEach((pair) => traverse(cb, pair))
	} else if (value instanceof YAMLSeq) {
		cb(value)
		value.items.forEach((node) => {
			traverse(cb, node)
		})
	}
}

let stats = {
	map: 0,
	seq: 0,
	pair: 0,
	scalar: 0,
}

const paths = []

function onNode<RT>(fn: (node: Scalar | Pair | YAMLMap | YAMLSeq) => RT) {
	return (node: Scalar | Pair | YAMLMap | YAMLSeq) => fn(node)
}

const ID = (function () {
	function hasAllKeys(keys: string | string[]) {
		return (node: YAMLMap) =>
			(Array.isArray(keys) ? keys : [keys]).every((key) => node.has(key))
	}
	function hasAnyKeys(keys: string | string[]) {
		return (node: YAMLMap) =>
			(Array.isArray(keys) ? keys : [keys]).some((key) => node.has(key))
	}
	function hasKey(key: string) {
		return (node: YAMLMap) => node.has(key)
	}
	function hasKeyEqualTo(key: string, value: any) {
		return (node: YAMLMap) => node.has(key) && node.get(key) === value
	}

	function composeFilters<N>(...fns: ((node: N) => boolean)[]) {
		fns = fns.reverse()
		return (node: unknown) => fns.every((fn) => fn(node as N))
	}

	const isYAMLMap = (v: unknown): v is YAMLMap => v instanceof YAMLMap
	const isYAMLSeq = (v: unknown): v is YAMLSeq => v instanceof YAMLSeq
	const isPair = (v: unknown): v is Pair => v instanceof Pair
	const isScalar = (v: unknown): v is Scalar => v instanceof Scalar

	const onYAMLMap = <RT>(fn: (node: YAMLMap) => RT) => (v: unknown) =>
		isYAMLMap(v) ? fn(v) : false
	const onYAMLSeq = <RT>(fn: (node: YAMLSeq) => RT) => (v: unknown) =>
		isYAMLSeq(v) ? fn(v) : false
	const onPair = <RT>(fn: (node: Pair) => RT) => (v: unknown) =>
		isPair(v) ? fn(v) : false
	const onScalar = <RT>(fn: (node: Scalar) => RT) => (v: unknown) =>
		isScalar(v) ? fn(v) : false

	const o = {
		action: {
			any: onYAMLMap(composeFilters(hasKey('actionType'))),
			builtIn: onYAMLMap(
				composeFilters(
					hasAllKeys(['actionType', 'funcName']),
					hasKeyEqualTo('actionType', 'builtIn'),
				),
			),
			evalObject: onYAMLMap(
				composeFilters(hasKeyEqualTo('actionType', 'evalObject')),
			),
		},
		keyValue: {
			actionType: onPair((node) => node.key.value === 'actionType'),
		},
		paths: {},
	}

	return o
})()

traverse((node) => {
	if (ID.action.any(node)) {
		paths.push(node)
	}
}, contents)

console.log(paths.map((p) => p.toJSON()))
console.log(paths.length)

export default Find
