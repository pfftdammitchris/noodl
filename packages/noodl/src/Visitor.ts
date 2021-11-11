import curry from 'lodash-es/curry.js'
import * as nt from 'noodl-types'
import * as u from '@jsmanifest/utils'
import * as nu from 'noodl-utils'
import type {
	YAMLNode,
	YAMLDocument,
	visitor,
	visitorFn,
} from './internal/yaml.js'
import {
	isNode,
	isScalar,
	isPair,
	isMap,
	isSeq,
	getReferenceNodes,
	getKeys,
	visit,
} from './internal/yaml.js'
import NoodlReference from './Reference.js'
import * as t from './types'

const is = nt.Identify

const wrapNativeVisitFn = curry(function wrappedNativeVisitFn(
	root: Record<string, YAMLNode>,
	doc: YAMLDocument,
	fn: (
		key: t.YAMLVisitArgs<YAMLNode>[0],
		node: t.YAMLVisitArgs<YAMLNode>[1],
		path: t.YAMLVisitArgs<YAMLNode>[2],
		meta: t.MetaObject<YAMLNode>,
	) => ReturnType<visitorFn<YAMLNode>>,
): visitorFn<YAMLNode> {
	return function nativeVisitNode(key, node, path) {
		const meta = {
			_node: node,
		} as Record<string, any>

		if (isScalar(node)) {
			if (u.isStr(node.value)) {
				meta.isReference = is.reference(node.value)
				meta.isRootKey = is.rootKey(node.value)
				meta.value = node.value

				if (meta.isReference) {
					if (meta.isRootKey) {
						meta.referencePath = []

						const datapath = nu.toDataPath(nu.trimReference(node.value))
						const rootKey = datapath.shift()
						const rootNode = root[rootKey]

						if (isNode(rootNode)) {
							let currentNode = rootNode

							while (currentNode) {
								meta.referencePath.push(currentNode)

								if (isNode(currentNode)) {
									if (isScalar(currentNode)) {
										if (u.isStr(currentNode.value)) {
											const isRootKey = is.rootKey(currentNode.value)
											if (is.reference(currentNode.value)) {
												//
											} else {
												const refNode = new NoodlReference(
													currentNode.value,
													isRootKey ? '' : currentNode.value,
												)

												meta.referencePath.push(
													...getReferenceNodes(root, currentNode.value),
												)

												if (is.rootKey(currentNode.value)) {
													//
												} else {
													//
												}
											}
										}
									} else if (isPair(currentNode)) {
										meta.referencePath.push(currentNode)
									} else if (isMap(currentNode)) {
										meta.referencePath.push(currentNode)
									} else if (isSeq(currentNode)) {
										meta.referencePath.push(currentNode)
									} else {
										meta.referencePath.push(doc.createNode(currentNode))
									}
								} else {
									meta.referencePath.push(
										u.isNil(currentNode)
											? currentNode
											: doc.createNode(currentNode),
									)
								}
							}
						}
					}
				}
			}
		} else if (isPair(node)) {
			meta.key = String(node.key)
			meta.value =
				(u.isObj(node.value) &&
					'toJSON' in node.value &&
					node.value.toJSON()) ||
				node.value
		} else if (isMap(node)) {
			meta.keys = getKeys(node)
			meta.length = meta.keys?.length || 0
		} else if (isSeq(node)) {
			meta.length = node.items.length
		}

		return fn(key, node, path, meta)
	}
})

class NoodlVisitor {
	root: Record<string, any>

	visit(
		fn: <N extends YAMLNode>(args: {
			key: Parameters<visitorFn<N>>[0]
			node: Parameters<visitorFn<N>>[1]
			path: Parameters<visitorFn<N>>[2]
			meta: t.MetaObject<N>
		}) => ReturnType<visitorFn<N>>,
		node: YAMLNode,
	) {
		const wrappedVisitor = wrapNativeVisitFn(this.root)
		const wrappedVisitFn = wrappedVisitor({} as YAMLDocument)

		visit(
			node,
			wrappedVisitFn(function (key, node, path, meta) {
				return fn({
					key,
					node,
					path,
					meta,
				})
			}),
		)
	}
}

export default NoodlVisitor
