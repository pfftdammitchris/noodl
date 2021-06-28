process.stdout.write('\x1Bc')
const invariant = require('invariant')
const path = require('path')
const u = require('@jsmanifest/utils')
const yaml = require('yaml')
const ntil = require('noodl-utils')
const { Identify } = require('noodl-types')
const fs = require('fs-extra')
const TrieSearch = require('trie-search')
const ncom = require('noodl-common')

function tap(fn, o) {
	if (u.isMap())
}


function getReferenceValue(docs)

class Reference {
	/** @type { string } ref */
	#ref = ''
	#value = null

	constructor(node) {
		this.#ref = node.value
		/** @type { yaml.Node } */
		this.node = node
		this.#value = null
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
		return this.#ref?.replace?.(/^[.\=@]+/i, '').replace(/[.\=@]+$/i, '') || ''
	}
	get paths() {
		return this.path.split('.')
	}
	get value() {
		return this.#value
	}
	set value(value) {
		this.#value = value || null
	}
	hasValue() {

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

	toJSON() {
		return {
			isRoot: this.isRoot(),
			isLocal: this.isLocal(),
			path: this.path,
			paths: this.paths,
			value: this.#value,
		}
	}

	toString() {
		return this.#ref
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

// console.log(docs.get('Global'))

const cache = new yaml.Document({})


/** @param { Map<string, yaml.Document<any, any>> } docs */
function createGetReferenceInfo(docs) {
	/** @param { Reference } ref */
	const getReferenceInfo = function _getByReference(ref) {
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
				if (!currentNode || !path) return currentNode
				if (yaml.isDocument(currentNode) || yaml.isMap(currentNode)) {
					if (currentNode.has(path)) {
						currentNode = currentNode.get(path, true)
						if (path === paths[paths.length - 1]) {
							// cache.setIn(refNode.paths, currentNode)
							console.log(`Last node in the loop`, {
								node: currentNode,
								path,
								paths,
							})
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

createGetReferenceInfo(docs)(({ getReferenceInfo }) => {
	for (const [name, visitee] of docs) {
		yaml.visit(visitee, {
			Scalar(key, node, path) {
				if (Identify.reference(node.value)) {
					const refNode = new Reference(node)
					const refValue = getReferenceInfo(refNode)
					console.log(`refNode: ${refNode}`, refNode.value)

					if (!refs.has(refNode.ref)) {
						refs.set(refNode.toString(), refNode)
						// let value = refNode.isLocal
						// 	? visitee.getIn(refNode.paths)
						// 	: docs.get(refNode.paths[0])?.getIn(refNode.paths[1].slice())
						Object.defineProperty(refNode, 'value', {
							configurable: true,
							enumerable: true,
							get: () =>
								refNode.isLocal
									? visitee.getIn(refNode.paths)
									: docs.get(refNode.paths[0])?.getIn(refNode.paths[1].slice()),
						})

						// 	tableItems.push([refStr, refNode.value])
					}
				}
			},
		})
	}
})

// console.table(tableItems)
// console.log(Array.from(docs.keys()))
fs.writeJsonSync(
	path.posix.join(__dirname, '../generated/refs-output.json'),
	refs,
	{ spaces: 2 },
)
