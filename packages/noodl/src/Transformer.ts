import yaml from 'yaml'
import get from 'lodash/get'
import { Node, Scalar } from 'yaml/types'
import flowRight from 'lodash/flowRight'
import NoodlRoot from './Root'
import NoodlUtils from './Utils'
import { isReference, isEvalReference, isLocalReference } from './utils/scalar'
import { isApplyReference } from './utils/pair'
import * as u from './utils/internal'
import * as T from './types'
import { Page } from '.'

export const _noodlSpecTransformers = (function () {
	// * Deeply finds the value to the reference and returns it (Does not mutate)
	// TODO - Support apply references
	const getReference = function _getReference(
		this: Transformer,
		node: Parameters<T.NoodlTransformer.Execute>[0],
		util: Parameters<T.NoodlTransformer.Execute>[1],
	): any {
		let value: any

		if (u.isScalar(node) && u.isStr(node.value)) {
			let path = node.value

			if (path.startsWith('..')) {
				return getReference.call(this, new Scalar(path.substring(2)), util)
			} else if (path.startsWith('.')) {
				return getReference.call(this, new Scalar(path.substring(1)), util)
			} else if (path.startsWith('=')) {
				return getReference.call(this, new Scalar(path.substring(1)), util)
			} else {
				if (path[0] === path[0].toUpperCase()) {
					return getRootReference.call(this, node, util)
				} else if (path[0] === path[0].toLowerCase()) {
					return getLocalReference.call(this, node, util)
				}
			}
		}

		return value
	}

	const getLocalReference: T.NoodlTransformer.Execute = function getLocalReference(
		node,
		util,
	) {
		return util.findPage(node)?.getIn?.(
			u
				.trimInitialDots(util.common.getScalarValue(node) as string)
				.split('.')
				.filter(Boolean),
		)
	}

	const getRootReference: T.NoodlTransformer.Execute = function getRootReference(
		node,
		util,
	) {
		return util.getValueFromRoot(util.common.getScalarValue(node))
	}

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
			if (u.isPair(node)) {
				if (String(node.key.value).endsWith('@')) {
					const ref = node.key.value
					// Start with the right side first because the reference application
					// is always determined by its value
					if (isReference(node.value)) {
						console.log('node.value.value', node.value.value)
						transformReference.call(this, node.value, util)
						console.log('node.value.value', node.value.value)
					}

					// Next, move to the key since the value is resolved
					node.key.value = ref.substring(0, ref.length - 1)
					if (isReference(node.key.value)) {
						transformReference.call(this, node.key, util)
						return yaml.visit.SKIP
					}
					if (u.isScalar(node.value)) return yaml.visit.SKIP
				}
			} else if (u.isScalar(node) && u.isStr(node.value)) {
				let value: any

				if (u.isScalar(node) && u.isStr(node.value)) {
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
						node.value = getReference.call(this, node, util)
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
	#util: T.NoodlVisitor.Utils
	#pages: T.InternalComposerBaseArgs['pages']
	#root: T.InternalComposerBaseArgs['root']
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
		this.#pages = pages
		this.#root = root
		this.#util = util
	}

	get pages() {
		return this.#pages
	}

	get root() {
		return this.#root
	}

	get util() {
		return this.#util
	}

	get transform() {
		return this.#transducer
	}

	compose(...transforms: T.NoodlTransformer.Execute[]) {
		const wrapExecute = (fn: T.NoodlTransformer.Execute) => (
			step: (node: Node) => Node,
		) => (node: Node) => {
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
