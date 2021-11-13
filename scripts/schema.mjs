import * as u from '@jsmanifest/utils'
// import * as ts from 'ts-morph'
import * as nt from 'noodl-types'
import fs from 'fs-extra'
import { Loader } from 'noodl'
import path from 'path'
import yaml from 'yaml'
import * as is from './is.mjs'

const toAbsPath = (...s) => path.resolve(path.join(process.cwd(), ...s))
const schema = await fs.readJson(toAbsPath('./configuration/yaml.schema.json'))

const agg = new Loader({
	config: 'meetd2',
	dataType: 'map',
	deviceType: 'web',
	env: 'test',
	loglevel: 'info',
	version: 'latest',
})

let actionProperties = {}
let componentProperties = {}
let configProperties = {}
let styleProperties = {}

/**
 *
 * @param { string } name
 * @param { yaml.Document | yaml.Document.Parsed } doc
 */
const run = (doc) => {
	yaml.visit(doc, {
		Scalar: (key, node, path) => {},
		Pair: (key, node, path) => {
			if (is.isStyle(node)) {
				const style = node.value
				if (yaml.isMap(style)) {
					for (const item of style.items) {
						if (
							yaml.isScalar(item.key) &&
							u.isStr(item.key.value) &&
							!nt.Identify.reference(item.key.value) &&
							!(item.key.value in styleProperties)
						) {
							styleProperties[item.key.value] = createProperty(
								item.key.value,
								item.value.value,
							)
						}
					}
				}
			}
		},
		Map: (key, node, path) => {
			if (is.isAction(node)) {
				for (const pair of node.items) {
					if (yaml.isScalar(pair.key) && u.isStr(pair.key.value)) {
						const key = pair.key.value
						if (!(key in actionProperties)) {
							actionProperties[key] = createProperty(key, pair.value)
						}
					}
				}
			} else if (is.isComponent(node)) {
				for (const pair of node.items) {
					if (yaml.isScalar(pair.key) && u.isStr(pair.key.value)) {
						const key = pair.key.value
						if (!(key in componentProperties)) {
							componentProperties[key] = createProperty(key, pair.value)
						}
					}
				}
			}
		},
		Seq: (key, node, path) => {},
	})
	return doc
}

/**
 *
 * @param { yaml.Document | yaml.Document.Parsed } doc
 */
const extractConfigMetadata = (doc) => {
	yaml.visit(doc, {
		Pair: (_, node) => {
			if (yaml.isScalar(node.key) && u.isStr(node.key.value)) {
				const key = node.key.value
				if (!(key in configProperties)) {
					configProperties[key] = createProperty(key, node.value)
				}
			}
		},
	})
	return doc
}

agg
	.init({
		dir: toAbsPath('generated/meetd2'),
		spread: ['BaseDataModel', 'BaseCSS', 'BasePage'],
		loadPages: true,
		loadPreloadPages: true,
	})
	.then(async () => {
		extractConfigMetadata(agg.root.get('meetd2'))

		for (const [name, doc] of agg.root) {
			run(doc)
		}
	})
	.then(() =>
		fs.writeJson(
			toAbsPath('data/data.json'),
			{
				actionProperties,
				componentProperties,
				configProperties,
				styleProperties,
			},
			{ spaces: 2 },
		),
	)
	.catch(console.error)

function createProperty(key, value, options) {
	const meta = { ...options }

	if (!meta.type) {
		if (yaml.isScalar(value)) {
			meta.type = u.isStr(value.value)
				? 'string'
				: u.isNum(value.value)
				? 'number'
				: u.isBool(value.value)
				? 'boolean'
				: null
		} else if (yaml.isSeq(value)) {
			meta.type = 'array'
		} else if (yaml.isMap(value) || yaml.isDocument(value)) {
			meta.type = 'object'
		} else {
			meta.type = u.isStr(value)
				? 'string'
				: u.isNum(value)
				? 'number'
				: u.isBool(value)
				? 'boolean'
				: u.isArr(value)
				? 'array'
				: u.isObj(value)
				? 'object'
				: null
		}
	}

	return meta
}

// await fs.writeJson(
// 	toAbsPath('data/data2.json'),
// 	{
// 		actionProperties,
// 		componentProperties,
// 		styleProperties,
// 	},
// 	{ spaces: 2 },
// )
