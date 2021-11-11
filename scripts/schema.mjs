import * as u from '@jsmanifest/utils'
import * as ts from 'ts-morph'
import * as nt from 'noodl-types'
import fs from 'fs-extra'
import NoodlAggregator from 'noodl-aggregator'
import path from 'path'
import yaml from 'yaml'

const toAbsPath = (...s) => path.resolve(path.join(process.cwd(), ...s))

const agg = new NoodlAggregator({
	config: 'meetd2',
	dataType: 'map',
	deviceType: 'web',
	env: 'test',
	loglevel: 'info',
	version: 'latest',
})

agg
	.init({
		dir: toAbsPath('generated/meetd2'),
		spread: ['BaseDataModel', 'BaseCSS', 'BasePage'],
		loadPages: true,
		loadPreloadPages: true,
	})
	.then(async () => {
		const data = {
			actionProperties: [],
			componentProperties: [],
			styleProperties: [],
		}

		const schema = {}

		/** @param { yaml.YAMLMap } node */
		const isAction = (node) =>
			['actionType', 'goto'].some((key) => node.has(key))

		/** @param { yaml.YAMLMap } node */
		const isComponent = (node) =>
			node.has('type') && ['children', 'style'].some((key) => node.has(key))

		/** @param { yaml.Pair } node */
		const isStyle = (node) =>
			yaml.isScalar(node.key) && node.key.value === 'style'

		for (const [name, doc] of agg.root) {
			yaml.visit(doc, {
				Scalar: (key, node, path) => {},
				Pair: (key, node, path) => {
					if (isStyle(node)) {
						const style = node.value
						if (yaml.isMap(style)) {
							for (const item of style.items) {
								if (
									yaml.isScalar(item.key) &&
									u.isStr(item.key.value) &&
									!nt.Identify.reference(item.key.value) &&
									!data.styleProperties.includes(item.key.value)
								) {
									data.styleProperties.push(item.key.value)
								}
							}
						}
					}
				},
				Map: (key, node, path) => {
					if (isAction(node)) {
						for (const pair of node.items) {
							if (yaml.isScalar(pair.key) && u.isStr(pair.key.value)) {
								const key = pair.key.value
								if (!data.actionProperties.includes(key)) {
									data.actionProperties.push(key)
								}
							}
						}
					} else if (isComponent(node)) {
						for (const pair of node.items) {
							if (yaml.isScalar(pair.key) && u.isStr(pair.key.value)) {
								const key = pair.key.value
								if (!data.componentProperties.includes(key)) {
									data.componentProperties.push(key)
								}
							}
						}
					}
				},
				Seq: (key, node, path) => {},
			})
		}
		return data
	})
	.then((data) =>
		fs.writeJson(toAbsPath('data/data.json'), data, { spaces: 2 }),
	)
	.catch(console.error)
