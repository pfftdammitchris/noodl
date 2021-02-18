import yaml, { Document } from 'yaml'
import { userEvent } from 'noodl-types'
import { findPair } from 'yaml/util'
import { Pair, Scalar, YAMLMap, YAMLSeq } from 'yaml/types'
import Identify from './Identify'
import * as s from './scalar'
import * as u from './internal'
import NoodlPage from '../NoodlPage'

export const transform = (function () {
	const _transformScalar = {
		reference(
			args: { doc: Document; pages: Map<string, NoodlPage>; root?: any },
			node: Scalar,
		) {
			node.value = getReference(args, node)
		},
	}
	const o = {
		...Object.entries(_transformScalar).reduce((acc, [op, fn]) => {
			acc[op] = (
				args: { doc: Document; root?: any },
				node: string | number | null | undefined | Scalar,
			) => {
				if (!(node instanceof Scalar)) node = new Scalar(node)
				return fn(args, node)
			}
			return acc
		}, {} as typeof _transformScalar),
	}
	return o
})()

export function flattenMap(
	doc: YAMLMap | yaml.Document | yaml.Document.Parsed,
) {
	const result = {} as { [key: string]: Node }
	if (doc instanceof YAMLMap) {
		doc.items.forEach((pair) => (result[pair.key] = pair.value))
	} else if (doc.contents instanceof YAMLMap) {
		doc.contents.items.forEach((node) => {
			if (node instanceof Pair) result[node.key] = node.value
		})
	} else if (doc.items) {
		doc.items.forEach((node) => {
			if (node instanceof Pair) result[node.key] = node.value
			else if (node instanceof YAMLMap) {
				node.items.forEach((n) => (result[n.key] = n.value))
			}
		})
	}
	return result
}

export function getReference(
	args: { doc: Document; root?: any },
	path: string,
): any
export function getReference(
	args: { doc: Document; root?: any },
	node: Scalar,
): any
export function getReference(
	args: { doc: Document; root?: any },
	node: string | Scalar,
) {
	let result: any

	if (u.isStr(node)) node = new Scalar(node)
	if (s.isReference(node)) {
		if (s.isLocalReference(node)) {
			result = args.doc.getIn(s.getPreparedKeyForDereference(node).split('.'))
		} else if (s.isRootReference(node)) {
			if (args.root) {
				const formattedKey = s.getPreparedKeyForDereference(node)
				const [rootKey, ...path] = formattedKey.split('.')

				console.log([rootKey, ...path])

				if (path.length) {
					if (u.isFnc(args.root[rootKey]?.getIn)) {
						result = args.root[rootKey].getIn(path)
					} else if (u.isFnc(args.root[rootKey]?.doc?.getIn)) {
						result = args.root[rootKey].doc.getIn(path)
					}
				} else {
					result = args.root[rootKey]
				}
			}
		} else if (s.isApplyReference(node)) {
			//
		} else if (s.isTraverseReference(node)) {
			//
		}
	}

	if (result instanceof Scalar && s.isReference(result)) {
		return getReference.call(args, result)
	} else if (u.isStr(result) && s.isReference(new Scalar(result))) {
		return getReference.call(args, result)
	}

	return result
}
