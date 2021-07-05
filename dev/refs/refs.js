process.stdout.write('\x1Bc')
const invariant = require('invariant')
const chalk = require('chalk')
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
const pathToInputDir = ncom.normalizePath(__dirname, `${basePath}/${configKey}`)
const pathToOutputFile = ncom.normalizePath(
	__dirname,
	`${basePath}/refs-output.json`,
)
const refs = new yaml.Document()
const docs = ncom.loadFiles(pathToInputDir, {
	as: 'map',
	type: 'doc',
	spread: 'BaseDataModel',
})
const cache = new yaml.Document({})

/** @param { Map<string, yaml.Document<any, any>> } docs */
function createGetReferenceInfo(docs) {
	/** @param { Reference } ref */
	const getReferenceInfo = function _getByReference(ref) {
		!cache.has(ref.path) && cache.set(ref.path, ref)

		if (ref.isRoot()) {
			const [rootKey, ...paths] = ref.paths

			let currentNode = docs.get(rootKey)

			if (!currentNode) {
				console.log(
					chalk.white(
						`The key ${chalk.yellow(rootKey)} from ${chalk.yellow(
							String(ref),
						)} did not exist in the root`,
					),
				)
			}

			for (const path of paths) {
				if (!path) {
					console.log(
						u.red(
							`Invalid path part "${u.yellow(path)}" in ${u.yellow(ref.ref)}`,
						),
					)
				}
				if (!currentNode || !path) return currentNode
				if (yaml.isDocument(currentNode) || yaml.isMap(currentNode)) {
					if (currentNode.has(path)) {
						currentNode = currentNode.get(path, true)
						if (path === paths[paths.length - 1]) {
							// cache.setIn(refNode.paths, currentNode)
							// console.log(`Last node in the loop`, {
							// 	node: currentNode,
							// 	path,
							// 	paths,
							// })
						}
					}
				}
			}
			return currentNode
		} else if (ref.isLocal()) {
			const [localKey, ...paths] = ref.paths
		}
	}

	/** @param { (args: { getReferenceInfo: typeof getReferenceInfo, docs: Map<string, yaml.Document<any, any>}) => void} fn */
	return (fn) => {
		fn({
			getReferenceInfo,
		})
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
				const refNode = new Reference(node, { context })

				if (context === 'BaseDataModel') {
					refNode.context = refNode.paths[0]
				}

				if (!refs.has(refNode.ref)) {
					refs.set(String(refNode), refNode)

					console.log(`Added new reference: ${u.cyan(String(refNode))}`)

					Object.defineProperty(refNode, 'value', {
						configurable: true,
						enumerable: true,
						get: () => {
							if (refNode.isLocal()) {
								const value = doc.getIn(refNode.paths)
								return value
							} else if (refNode.isRoot()) {
								const [rootKey, ...paths] = refNode.paths
								const deRefNode = root.get(rootKey)
								// Page doc
								if (yaml.isDocument(deRefNode)) {
									if (yaml.isMap(deRefNode.contents)) {
										if (deRefNode.contents.items.length) {
											return deRefNode.getIn(paths)
										}
										return deRefNode.toJS()
									}
								}
								if (yaml.isMap(refNode)) {
									return refNode.getIn(paths)
								}
							}
							return node.value
						},
					})
				}
			}
		},
	})
}

createGetReferenceInfo(docs)(async ({ getReferenceInfo }) => {
	const aggregator = new Aggregator(configKey)

	const rootConfig = await aggregator.loadRootConfig(configKey)
	parse({ context: configKey, refs, doc: rootConfig, root: aggregator.root })

	const appConfig = await aggregator.loadAppConfig(rootConfig)
	parse({
		context: 'cadlEndpoint',
		refs,
		doc: appConfig,
		root: aggregator.root,
	})

	await aggregator.loadPreloadPages()

	for (const node of appConfig.get('preload').items) {
		const context = node.value
		const preloadedDoc = aggregator.root.get(context)
		parse({ context, doc: preloadedDoc, refs, root: aggregator.root })
	}

	// const pageDocs = await aggregator.loadPages({ chunks: 5 })
	// for (const pageDoc of pageDocs) {
	// 	parse(refs, pageDoc, aggregator.root)
	// }

	await fs.writeJson(pathToOutputFile, refs, { spaces: 2 })
})
