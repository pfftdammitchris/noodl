// @ts-nocheck
import path from 'path'
import fs from 'fs-extra'
import yaml, { createNode, Document } from 'yaml'
import { findPair, toJSON } from 'yaml/util'
import { Node, Scalar, Pair, YAMLMap, YAMLSeq } from 'yaml'
import createAggregator from '../api/createAggregator'

const src = fs.readFileSync('./data/cadlEndpoint.yml', 'utf8')
const nodes = yaml.parseDocument(src)

export function createPair(key, value) {
	return new Pair(createNode(key), createNode(value))
}

// function createDataKeyObject() {
// 	const node = new YAMLMap()
// 	const o = {
// 		addDataKey: (key: string, value: any) => {
// 			node.add(createPair(key, value))
// 			return o
// 		},
// 		removeDataKey(key: string) {
// 			node.delete(key)
// 			return o
// 		},
// 		get node() {
// 			return node
// 		},
// 		get dataKey() {
// 			return node.toJSON()
// 		},
// 	}
// 	return o
// }

function createDataKeyObject({ dataKey, actions }) {
	const node = new YAMLMap()
	if (dataKey) {
		if (typeof dataKey === 'string') {
			node.set('dataKey', dataKey)
		} else {
			const dataKeyNode = new YAMLMap()
			Object.entries(dataKey).forEach(([k, v]) =>
				dataKeyNode.add(createPair(k, v)),
			)
			node.set('dataKey', dataKeyNode)
		}
	}
	if (actions) {
		const actionsNode = new YAMLSeq()
		actions.forEach((action) => {
			actionsNode.add(createNode(action))
		})
		node.set('actions', actionsNode)
	}
	return node
}

function createEmitObject() {
	const node = new YAMLMap()
	const dataKeyObj = createDataKeyObject()
	const actions = new YAMLSeq()
	const o = {
		get node() {
			return node
		},
		toJS() {
			return node.toJSON()
		},
	}
	return p
}

function createImage(opts?: { path: string }) {
	const node = new YAMLMap()
	node.set('type', 'image')
	const path = new Scalar(opts?.path)
	node.add(new Pair('path', path))
	return node
}

const dataKey = createDataKeyObject({
	dataKey: {
		var1: 'itemObject',
		var2: 'itemObject.key',
	},
	actions: [
		{
			'=.builtIn.object.set': {
				dataIn: {
					object: '=..generalInfo',
					key: '$var.key',
					value: '$var.value',
				},
			},
		},
	],
})
console.log(dataKey.toJSON())
// const aggregator = createAggregator({
// 	config: 'meet2d',
// })

// aggregator
// 	.init()
// 	.then(async ([rootConfig, appConfig]) => {
// 		console.log(
// 			await compile(appConfig, 'types.d.ts', {
// 				format: true,
// 			}),
// 		)
// 	})
// 	.catch((err) => {
// 		throw new Error(err)
// 	})

// compile from file
// compileFromFile('foo.json').then((ts) => fs.writeFileSync('foo.d.ts', ts))
