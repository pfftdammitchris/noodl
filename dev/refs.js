process.stdout.write('\x1Bc')
const invariant = require('invariant')
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
	{
		as: 'map',
		type: 'doc',
		spread: 'BaseDataModel',
	},
)

console.log(docs.get('Global'))

return

const tableItems = []
const cache = new yaml.Document({})

let aliasDocName = ''
let aliasSource = ''

/** @param { Map<string, yaml.Document<any, any>> } docs */
function createGetByReference(docs) {
	/** @param { Reference } ref */
	const getByReference = function _getByReference(ref) {
		!cache.has(ref.path) && cache.set(ref.path, ref)

		if (ref.isRoot()) {
			const [rootKey, ...paths] = ref.paths

			if (!docs.has(rootKey)) {
				console.log(
					u.red(
						`The root key "${rootKey}" from "${ref.ref}" is not in the root`,
					),
				)
			}

			let currentNode = docs.get(rootKey)

			if (!currentNode) {
				console.log(
					u.red(`Key "${u.yellow(rootKey)}" did not exist in the root`),
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
				if (!currentNode || !path) break
				if (yaml.isNode(currentNode)) {
					if (currentNode.has(path)) {
						if (!yaml.isNode(currentNode.get(path))) {
							console.log(
								u.red(
									`The next node after path "${path}" in "${ref.ref}" is not a node`,
								),
							)
						}
						currentNode = currentNode.get(path, true)
						if (path === paths[paths.length - 1]) {
							// cache.setIn(refNode.paths, currentNode)
							console.log(currentNode.toJSON())
						}
					}
				} else {
					console.log(
						u.red(
							`currentNode is no longer a node. Current path: "${path}" from "${ref.ref}"`,
						),
					)
				}
			}
		} else if (ref.isLocal()) {
			const [localKey, ...paths] = ref.paths
		}
	}

	/** @param { (args: { getByReference: typeof getByReference, docs: Map<string, yaml.Document<any, any>}) => void} fn */
	return (fn) => {
		fn({
			getByReference,
		})
	}
}

createGetByReference(docs)(({ getByReference }) => {
	for (const [name, visitee] of docs) {
		yaml.visit(visitee, {
			Scalar(key, node, path) {
				if (Identify.reference(node.value)) {
					const refNode = new Reference(node)
					const refValue = getByReference(refNode)

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
})

// console.table(tableItems)
// console.log(Array.from(docs.keys()))
// fs.writeJsonSync(
// 	path.posix.join(__dirname, '../generated/refs-output.json'),
// 	refs.toJSON(),
// 	{ spaces: 2 },
// )
