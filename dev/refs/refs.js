process.stdout.write('\x1Bc')
const nc = require('noodl-common')
const path = require('path')
const u = require('@jsmanifest/utils')
const yaml = require('yaml')
const { Identify } = require('noodl-types')
const fs = require('fs-extra')
const ncom = require('noodl-common')
const Aggregator = require('noodl-aggregator').default
const Reference = require('./Reference')

const configKey = 'meet4d'
const basePath = '../../generated'
const pathToOutputFile = ncom.normalizePath(
	__dirname,
	`${basePath}/refs-output.json`,
)
const refs = new yaml.Document()

/** @param { string | string[] } paths */
function toPaths(paths) {
	return u.isStr(paths) ? Identify.reference.format(paths).split('.') : paths
}

/**
 * @param { yaml.YAMLMap<any, any> } node
 * @param { string | string[] } paths
 * @returns { any }
 */
function getInMap(node, paths) {
	if (node.items.length) return node.getIn(toPaths(paths))
	return node
}

/**
 * @param { object } opts
 * @param { yaml.Document<any> } opts.refs
 * @param { string } opts.context
 * @param { Reference } opts.reference
 * @param { yaml.Scalar<string> } opts.node
 * @param { Map<string, yaml.Node | yaml.Document<any>> } opts.root
 */
function insertToRefs({
	refs,
	context,
	reference,
	node,
	root,
	mergeWithOutput,
}) {
	if (!refs.has(context)) refs.set(context, new yaml.YAMLSeq())
	/** @type { yaml.YAMLSeq<any> } */
	const entry = refs.get(context)

	if (!entry) {
		console.log(u.red(`No entry was found for context: ${context}`))
	} else {
		const newEntry = refs.createNode({
			...reference.toJSON(),
		})

		console.log(`mergeWithOutput`, mergeWithOutput)

		entry.add(newEntry)
	}
}

/**
 * @param { yaml.Document } refs
 * @param { yaml.Document } doc
 * @param { Map } root
 */
const parse = function ({ context = '', refs, doc, root }) {
	yaml.visit(doc, {
		Scalar: (key, node) => {
			if (Identify.reference(node.value)) {
				const reference = new Reference(node, { context })

				if (context === 'BaseDataModel') {
					reference.context = reference.paths[0]
				}

				if (reference.isRoot()) {
					console.log(
						`[${u.cyan('ROOT')}]: ${u.white(reference)} (${nc.magenta(
							context,
						)})`,
					)

					const localDoc = root.get(reference.paths[0])
					const yamlMap = yaml.isMap(localDoc)
						? localDoc
						: yaml.isDocument(localDoc) &&
						  yaml.isMap(localDoc.contents) &&
						  localDoc.contents

					if (yamlMap) {
						const paths = reference.paths.slice(1)
						reference.value = getInMap(yamlMap, paths)
						insertToRefs({
							context,
							node,
							root,
							refs,
							reference,
							mergeWithOutput: {
								exists: yamlMap.hasIn(paths),
							},
						})
					}
				} else if (reference.isLocal()) {
					console.log(
						`[${nc.coolGold('LOCAL')}]: ${u.white(reference)} (${nc.magenta(
							context,
						)})`,
					)

					const yamlMap = yaml.isMap(doc)
						? doc
						: (yaml.isDocument(doc) &&
								yaml.isMap(doc.contents) &&
								doc.contents) ||
						  doc

					if (yamlMap) {
						reference.value = getInMap(yamlMap, reference.paths)
						insertToRefs({
							context,
							node,
							root,
							refs,
							reference,
							mergeWithOutput: {
								exists: yamlMap.hasIn(reference.paths),
							},
						})
					}
				}
			}
		},
	})
}

;(async () => {
	const aggregator = new Aggregator(configKey)
	const args = { refs, root: aggregator.root }
	const rootConfig = await aggregator.loadRootConfig(configKey)
	parse({ context: configKey, doc: rootConfig, ...args })
	const appConfig = await aggregator.loadAppConfig(rootConfig)
	parse({ context: aggregator.appKey, doc: appConfig, ...args })

	await aggregator.loadPreloadPages()

	for (const node of appConfig.get('preload').items) {
		const context = node.value
		const preloadedDoc = aggregator.root.get(context)
		parse({ context, doc: preloadedDoc, ...args })
	}

	await fs.writeJson(pathToOutputFile, refs, { spaces: 2 })
})()
