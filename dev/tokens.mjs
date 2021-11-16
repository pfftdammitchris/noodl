import * as u from '@jsmanifest/utils'
import * as ts from 'ts-morph'
import * as nt from 'noodl-types'
import uniq from 'lodash/uniq.js'
import noodl, { Loader } from 'noodl'
import fs from 'fs-extra'
import path from 'path'
import yaml from 'yaml'

const toAbsPath = (...str) => path.resolve(path.join(process.cwd(), ...str))

const configYml = fs.readFileSync(
	toAbsPath('./data/meetd2/AboutAitmed_en.yml'),
	'utf8',
)
const configDoc = yaml.parseDocument(configYml, {})
const configJson = yaml.parse(configYml)

const agg = new NoodlAggregator({
	config: 'meetd2',
	deviceType: 'web',
	env: 'test',
	version: 'latest',
})

await agg.init({
	dir: toAbsPath('data/meetd2'),
	loadPages: true,
	loadPreloadPages: true,
	spread: ['BaseDataModel', 'BaseCSS', 'BasePage'],
})

const data = {
	actionProperties: [],
	componentProperties: [],
	styleProperties: [],
}

const is = {
	/** @param { yaml.YAMLMap } node */
	actionObject(node) {
		return ['actionType', 'goto'].some((key) => node.has(key))
	},
	/** @param { yaml.YAMLMap } node */
	componentObject(node) {
		if (node.has('type')) {
			if (['children', 'style'].some((key) => node.has(key))) {
				return true
			}
			const type = node.get('type')
			if (u.isStr(type) && nt.componentTypes.includes(type)) {
				return true
			}
		}
		return false
	},
	/** @param { yaml.Pair } node */
	styleKeyValue(node) {
		return yaml.isScalar(node.key) && node.key === 'style'
	},
	/** @param { yaml.Pair } node */
	stringPairKey(node) {
		return yaml.isScalar(node.key) && u.isStr(node.key.value)
	},
}

/**
 * @param { yaml.Node } node
 * @returns { string[] }
 */
const getKeys = (node) => {
	if (yaml.isMap(node)) {
		return node.items.map((item) =>
			yaml.isNode(item.key) ? item.key.toString() : item.key,
		)
	}
}

/**
 * @param { any[] } arr
 * @param { string | string[] } keys
 * @returns { any[] }
 */
const mergeUniqKeys = (arr = [], keys) => {
	for (const key of u.array(keys)) {
		if (!arr.includes(key)) arr.push(key)
	}
	return arr
}

for (const [name, doc] of agg.root) {
	yaml.visit(doc, {
		Scalar: (key, node, path) => {},
		Pair: (key, node, path) => {
			if (is.stringPairKey(node)) {
				//
			}
		},
		Map: (key, node, path) => {
			if (is.actionObject(node)) {
				mergeUniqKeys(data.actionProperties, getKeys(node))
			} else if (is.componentObject(node)) {
				mergeUniqKeys(data.componentProperties, getKeys(node))
			} else if (is.styleKeyValue(node)) {
				mergeUniqKeys(data.styleProperties, getKeys(node.value))
			}
		},
		Seq: (key, node, path) => {
			//
		},
	})
}

fs.writeJsonSync(toAbsPath('data/data.json'), parsed, { spaces: 2 })
