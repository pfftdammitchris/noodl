// @ts-nocheck
import yaml from 'yaml'
import { Node, isPair, isScalar } from 'yaml'
import flowRight from 'lodash/flowRight'
import NoodlRoot from './Root'
import NoodlUtils from './Utils'
import { isReference } from './utils/scalar'
import * as u from './utils/internal'
import * as T from './types'

export const _noodlSpecTransformers = (function () {
	const createInternalTransformer = (
		fn: T.NoodlTransformer.Execute,
	): T.NoodlTransformer.Execute => {
		return function internalTransformer(this: Transformer, ...args) {
			return fn.call(this, ...args)
		}
	}

	const o = {
		// NOTE: Only use this if the value is intended to be a reference pointing somewhere
		reference: createInternalTransformer(function transformReference(
			node,
			util,
		): any {
			if (isPair(node)) {
				if (isScalar(node.key) && String(node.key.value).endsWith('@')) {
					const ref = node.key.value as string
					// Start with the right side first because the reference application
					// is always determined by its value
					if (isScalar(node.value) && isReference(node.value)) {
						console.log('node.value.value', node.value.value)
						transformReference.call(this, node.value, util)
						console.log('node.value.value', node.value.value)
					}

					// Next, move to the key since the value is resolved
					node.key.value = ref.substring(0, ref.length - 1)
					if (isScalar(node.key) && isReference(String(node.key.value))) {
						transformReference.call(this, node.key, util)
						return yaml.visit.SKIP
					}
					if (isScalar(node.value)) return yaml.visit.SKIP
				}
			} else if (isScalar(node) && u.isStr(node.value)) {
				let value: any

				if (isScalar(node) && u.isStr(node.value)) {
					if (node.value.startsWith('..')) {
						node.value = node.value.substring(2)
						transformReference.call(this, node, util)
					} else if (node.value.startsWith('.')) {
						node.value = node.value.substring(1)
						transformReference.call(this, node, util)
					} else if (node.value.startsWith('=')) {
						node.value = node.value.substring(1)
						transformReference.call(this, node, util)
					} else {
						// node.value = getReference.call(this, node, util)
						// if (node.value[0] === node.value[0].toUpperCase()) {
						// 	// If its in another object in the root, the funcs need to reference
						// 	// their NoodlPage instead in order for getLocalReference to operate
						// 	// as intended
						// 	// let [refKey, ...paths] = node.value.split('.')
						// 	// let refNode

						// 	// if (util.pages.has(refKey)) {
						// 	// 	const page = util.pages.get(refKey)
						// 	// 	if (paths.length) {
						// 	// 		if (paths.length === 1) node.value = page?.getIn(paths[0])
						// 	// 		else node.value = page?.getIn(paths)
						// 	// 	} else {
						// 	// 		node.value = page?.doc.contents
						// 	// 	}
						// 	// } else {
						// 	// 	refNode = util.root.get(refKey)
						// 	// 	if (paths.length) {
						// 	// 		if (u.isMap(refNode)) {
						// 	// 			node.value = refNode.getIn(paths)
						// 	// 		} else if (u.isSeq(refNode)) {
						// 	// 			node.value = refNode.getIn(paths)
						// 	// 		} else {
						// 	// 			node.value = get(refNode, paths)
						// 	// 		}
						// 	// 	} else {
						// 	// 		node.value = refNode
						// 	// 	}
						// 	// }
						// 	node.value = getReference.call(this, node, util)
						// } else if (node.value[0] === node.value[0].toLowerCase()) {
						// 	node.value = getReference.call(this, node, util)
						// }
						if (isReference(node.value)) {
							transformReference.call(this, node, util)
						}
					}
				}

				return value
			}
		}),
	}

	return o
})()

class Transformer implements T.InternalComposerBaseArgs {
	#transducer: (node: Node) => any = (node) => node
	pages: T.InternalComposerBaseArgs['pages']
	root: T.InternalComposerBaseArgs['root']
	util: T.NoodlVisitor.Utils
	transforms = [] as T.NoodlTransformer.Execute[]

	constructor({
		pages,
		root,
		util = new NoodlUtils({ pages, root }),
	}: {
		pages: T.Pages
		root: NoodlRoot
		util?: T.NoodlVisitor.Utils
	}) {
		this.pages = pages
		this.root = root
		this.util = util
	}

	get transform() {
		return this.#transducer
	}

	compose(...transforms: T.NoodlTransformer.Execute[]) {
		const wrapExecute =
			(fn: T.NoodlTransformer.Execute) =>
			(step: (node: Node) => Node) =>
			(node: Node) => {
				fn.call(this, node, this.util)
				return step(node)
			}
		return flowRight(...transforms.map(wrapExecute))((node: Node) => node)
	}

	createTransform(fn: T.NoodlTransformer.Execute) {
		if (this.transforms.includes(fn)) return this
		this.transforms.push(fn)
		this.#transducer = this.compose(...this.transforms)
		return this
	}
}

export default Transformer
