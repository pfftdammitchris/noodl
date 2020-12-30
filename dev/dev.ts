import { config } from 'dotenv'
config()
import axios from 'axios'
import produce from 'immer'
import chalk from 'chalk'
import fs from 'fs-extra'
import path from 'path'
import yaml, { createNode } from 'yaml'
import xml2parser from 'fast-xml-parser'
import { Pair, Scalar, YAMLMap, YAMLSeq } from 'yaml/types'
import { findPair } from 'yaml/util'
import globby from 'globby'
import countBy from 'lodash/countBy'
import isNaN from 'lodash/isNaN'
import has from 'lodash/has'
import get from 'lodash/get'
import sortBy from 'lodash/sortBy'
import orderBy from 'lodash/orderBy'
import isPlainObject from 'lodash/isPlainObject'
import * as t from 'typescript-validators'
import {
	forEachDeepKeyValue,
	getFilePath,
	sortObjPropsByKeys,
} from '../src/utils/common'
import createAggregator from '../src/api/createAggregator'
import { isEmitObj } from '../src/utils/noodl-utils'

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

function onKeyValue(keyValue: Pair) {
	//
}

function getTypings(doc: yaml.Document['contents']) {
	switch (doc.type) {
		case 'ALIAS':
		case 'BLOCK_FOLDED':
		case 'BLOCK_LITERAL':
		case 'COMMENT':
		case 'DIRECTIVE':
		case 'DOCUMENT':
		case 'FLOW_MAP':
		case 'FLOW_SEQ':
		case 'MAP':
		case 'MAP_KEY':
		case 'MAP_VALUE':
		case 'PLAIN':
		case 'QUOTE_DOUBLE':
		case 'QUOTE_SINGLE':
		case 'SEQ':
		case 'SEQ_ITEM':
		default:
			break
	}
}

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

const o = createObjectUtils(
	loadFiles({
		dir: 'data/objects',
		ext: 'json',
	}),
)

fs.writeJsonSync('./results.json', o.getAllUrls(), {
	spaces: 2,
})
