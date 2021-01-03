import { config } from 'dotenv'
config()
import axios from 'axios'
import produce, { applyPatches, enablePatches } from 'immer'
import chalk from 'chalk'
import fs from 'fs-extra'
import path from 'path'
import { ActionType, ComponentType, identify } from 'noodl-types'
import yaml, { createNode } from 'yaml'
import xml2parser from 'fast-xml-parser'
import { Pair, Scalar, YAMLMap, YAMLSeq } from 'yaml/types'
import globby from 'globby'
import isNil from 'lodash/isNil'
import isPlainObject from 'lodash/isPlainObject'
import * as t from 'typescript-validators'
import {
	forEachDeepKeyValue,
	getFilePath,
	sortObjPropsByKeys,
} from '../src/utils/common'
import createAggregator from '../src/api/createAggregator'
import { AnyFn } from '../src/types'
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
	return globby
		.sync(path.resolve(getFilePath(dir), `**/*.${ext}`))
		.reduce(
			(acc, filepath) =>
				acc.concat(
					ext === 'json'
						? fs.readJsonSync(filepath)
						: yaml.parseDocument(fs.readFileSync(filepath, 'utf8')),
				),
			[],
		)
}

export interface QueryKeywordsResultObject<Keywords extends string[]> {
	name: string
	occurrences: Record<Keywords[number], number>
	results: KeywordResult[]
}

export interface KeywordResultProperty {
	type: 'key'
	keyword: string
	object: { [key: string]: any }
}

export interface KeywordResultValue {
	type: 'value'
	keyword: string
	object: { [key: string]: any }
}

export type KeywordResult = KeywordResultProperty | KeywordResultValue

function queryKeywords<Keywords extends string[]>(
	keywords: Keywords[number] | Keywords,
	config: {
		obj: { [key: string]: any }
		exact?: boolean
		keys?: string[]
	},
) {
	keywords = (Array.isArray(keywords) ? keywords : [keywords]) as Keywords
	const results = [] as QueryKeywordsResultObject<Keywords>[]
	const base = config.keys
		? config.keys.reduce(
				(acc, key) =>
					key in config.obj
						? Object.assign(acc, { [key]: config.obj[key] })
						: acc,
				{},
		  )
		: config.obj

	Object.keys(base).forEach((name) => {
		const result = {
			name,
			occurrences: (keywords as Keywords).reduce(
				(acc, keyword) => Object.assign(acc, { [keyword]: 0 }),
				{},
			),
			results: [],
		} as QueryKeywordsResultObject<Keywords>

		;(keywords as Keywords).forEach((keyword) => {
			if (!keyword) return
			let test: (...args: any[]) => boolean
			if (!config.exact) {
				const regex = new RegExp(keyword, 'i')
				test = (key) => typeof key === 'string' && regex.test(key)
			} else {
				test = (key, keyword) => key === keyword
			}

			const keywordResult = { keyword } as KeywordResult

			forEachDeepKeyValue((key, value) => {
				if (typeof value === 'boolean') {
					//
				} else if (typeof value === 'function') {
					//
				} else if (typeof value === 'number') {
					//
				} else if (typeof value === 'object') {
					if (value === null) {
						//
					} else {
						//
					}
				} else if (typeof value === 'string') {
					//
				} else if (typeof value === 'undefined') {
					//
				}
			}, base)
		})

		result.results.length && results.push(result)
	})

	return results
}

// const docs = loadFiles({
// 	dir: 'data/objects',
// 	ext: 'yml',
// })
// const numDocs = docs.length

// fs.writeJsonSync(getFilePath('./results.json'), docs, { spaces: 2 })

// for (let index = 0; index < numDocs; index++) {
// 	const doc = docs[index]
// 	const contents = doc.contents

// 	if (contents instanceof YAMLMap) {
// 		contents.items.forEach((pair, index) => {
// 			//
// 		})
// 	} else if (contents instanceof YAMLSeq) {
// 		contents.items.forEach((value, index) => {
// 			//
// 		})
// 	}
// }

export const createObjectUtils = function (objs: any) {
	objs = Array.isArray(objs) ? objs : [objs]

	const o = {
		getObjectsThatContainKeys(keys: string | string[]): any[] {
			const keywords = Array.isArray(keys) ? keys : [keys]
			const results = []
			forEachDeepKeyValue(
				(key, value, obj) => keywords.includes(key) && results.push(obj),
				objs,
			)
			return results
		},
		getKeyCounts(keys?: string | string[]): Record<string, number> {
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
		getPaths() {
			const results = [] as string[]
			forEachDeepKeyValue((key, value, obj) => {
				if (typeof value === 'string') {
					if (value.startsWith('http')) {
						!results.includes(value) && results.push(value)
					} else if (/(path|resource)/i.test(key)) {
						!results.includes(value) && results.push(value)
					}
				}
			}, objs)
			return results.sort()
		},
	}

	return o
}

// const o = createObjectUtils(
// 	loadFiles({
// 		dir: 'data/objects',
// 		ext: 'json',
// 	}),
// )

// fs.writeJsonSync('./results.json', o.getKeyCounts(), {
// 	spaces: 2,
// })

const signInYml = fs.readFileSync(
	getFilePath('data/generated/yml/SignIn.yml'),
	'utf8',
)

const doc = yaml.parseDocument(signInYml)
const contents = doc.contents as YAMLMap

export const id = (function () {
	const hasAnyKeys = (keys: string | string[], v: YAMLMap) =>
		(Array.isArray(keys) ? keys : [keys]).some((key) => v.has(key))
	const exists = (v: unknown) => !isNil(v)
	const isActionType = (actionType: ActionType, v: YAMLMap) =>
		v.get('actionType') === actionType
	const isPair = (v: unknown): v is Pair => v instanceof Pair
	const isScalar = (v: any): v is Scalar => exists(v) && v instanceof Scalar
	const isYAMLMap = (v: any): v is YAMLMap => exists(v) && v instanceof YAMLMap
	const isYAMLSeq = (v: any): v is YAMLSeq => exists(v) && v instanceof YAMLSeq

	const o = {
		action: Object.entries(identify.action).reduce(
			(acc, [key, value]) =>
				Object.assign(acc, {
					[key]: (value) => {
						return isYAMLMap(value) && identify.action[key](value.toJSON())
					},
				}),
			{} as {
				[K in keyof typeof identify.action]: (value: YAMLMap) => boolean
			},
		),
		actionChain(v: unknown) {
			return (
				isYAMLSeq(v) &&
				v.items.every(
					(obj) => isYAMLMap(obj) && identify.action.any(obj.toJSON()),
				)
			)
		},
		component: Object.entries(identify.component).reduce(
			(acc, [key, value]) =>
				Object.assign(acc, {
					[key]: (value) => {
						return isYAMLMap(value) && identify.component[key](value.toJSON())
					},
				}),
			{} as {
				[K in keyof typeof identify.component]: (value: YAMLMap) => boolean
			},
		),
		emit(v: unknown) {
			return isYAMLMap(v) && identify.emit(v.toJSON())
		},
		goto(v: unknown) {
			return isYAMLMap(v) && identify.goto(v.toJSON())
		},
		gotoUrl(v: unknown) {
			return isScalar(v) && identify.gotoUrl(v.toJSON())
		},
		gotoObject(v: unknown) {
			return isYAMLMap(v) && identify.gotoObject(v.toJSON())
		},
		style: {
			any(v: unknown) {
				return isYAMLMap(v) && identify.style.any(v.toJSON())
			},
			border(v: unknown) {
				return isYAMLMap(v) && identify.style.border(v.toJSON())
			},
		},
	}

	return o
})()

const actionChain = createNode([
	{ goto: 'SignIn' },
	{ actionType: 'evalObject', object: null },
	{ actionType: 'popUp' },
])

console.log(
	`is s an action chain? --> ${chalk.magenta(
		identify.actionChain(actionChain) ? 'YES' : 'NO',
	)}`,
)
