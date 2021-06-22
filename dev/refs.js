process.stdout.write('\x1Bc')
const u = require('@jsmanifest/utils')
const yaml = require('yaml')
const ntil = require('noodl-utils')
const { Identify } = require('noodl-types')
const fs = require('fs-extra')
const TrieSearch = require('trie-search')
const ncom = require('noodl-common')

class Reference {
	constructor(node) {
		/** @type { yaml.Node } */
		this.node = node
		/** @type { string } */
		this.ref = node.value
		this.value = null
		/** @type { yaml.Node | null } */
		this._prev = null
		/** @type { yaml.Node | null } */
		this._next = null
	}
	isRoot() {
		return !!this.path && this.path[0].toUpperCase() === this.path[0]
	}
	isLocal() {
		return !!this.path && this.path[0].toLowerCase() === this.path[0]
	}
	/** @return { string } */
	get path() {
		return this.ref?.replace?.(/^[.\=@]+/i, '').replace(/[.\=@]+$/i, '') || ''
	}
	get paths() {
		return this.path.split('.')
	}
	isFormatted(value) {
		return !/^[a-zA-Z]/i.test(value)
	}
	/** @return { yaml.Node } */
	prev() {
		return this._prev
	}
	/** @return { yaml.Node } */
	next() {
		return this._next
	}
}

const trie = new TrieSearch()
const parse = new ntil.Parser()
const refs = new yaml.Document()
const docs = ncom.loadFiles(
	ncom.normalizePath(__dirname, '../generated/meet4d'),
	{ as: 'map', type: 'doc' },
)

const tableItems = []
const cache = new yaml.Document({})

let aliasDocName = ''
let aliasSource = ''

for (const [name, visitee] of docs) {
	yaml.visit(visitee, {
		Scalar(key, node, path) {
			if (Identify.reference(node.value)) {
				const refNode = new Reference(node)

				!cache.has(refNode.path) && cache.set(refNode.path, refNode)

				if (refNode.isRoot()) {
					const [rootKey, ...paths] = refNode.paths
					!cache.has(rootKey) && cache.set(rootKey, docs.get(rootKey))

					let currentNode = docs.get(rootKey)

					for (const path of paths) {
						if (!currentNode || !path) break
						if (currentNode.has(path)) {
							if (yaml.isNode(currentNode.get(path))) {
								currentNode = currentNode.get(path, true)
								if (path === paths[paths.length - 1]) {
									cache.setIn(refNode.paths, currentNode)
								}
							} else {
								// console.log(
								// 	`The next node after path "${path}" in "${refNode.paths}" is not a node!`,
								// )
							}
						}
					}
				} else if (refNode.isLocal()) {
					const [localKey, ...paths] = refNode.paths
				}

				// if (!refs.has(refStr)) {
				// 	refs.set(refStr, refNode)
				// 	// let value = refNode.isLocal
				// 	// 	? visitee.getIn(refNode.paths)
				// 	// 	: docs.get(refNode.paths[0])?.getIn(refNode.paths[1].slice())
				// 	Object.defineProperty(refNode, 'value', {
				// 		configurable: true,
				// 		enumerable: true,
				// 		get: () =>
				// 			refNode.isLocal
				// 				? visitee.getIn(refNode.paths)
				// 				: docs.get(refNode.paths[0])?.getIn(refNode.paths[1].slice()),
				// 	})

				// 	tableItems.push([refStr, refNode.value])
				// }
			}
		},
	})
}

// console.table(tableItems)
// console.log(Array.from(docs.keys()))
// fs.writeJsonSync(
// 	path.posix.join(__dirname, '../generated/refs-output.json'),
// 	refs.toJSON(),
// 	{ spaces: 2 },
// )
