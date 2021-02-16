import yaml, { Document } from 'yaml'
import { userEvent } from 'noodl-types'
import { findPair } from 'yaml/util'
import { Pair, Scalar } from 'yaml/types'
import Identify from './Identify'
import * as s from './scalar'
import * as u from './internal'
import NoodlPage from '../NoodlPage'

export const transform = (function () {
	const _transformScalar = {
		reference(args: { doc: Document; root?: any }, node: Scalar) {
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

				if (path) {
					if (u.isFnc(args.root[rootKey]?.doc?.getIn)) {
						result = args.root[rootKey].doc.getIn(path)
					} else if (u.isFnc(args.root[rootKey]?.getIn))
						result = args.root[rootKey].getIn(path)
				} else {
					result = args.root[rootKey]
				}
			}
		} else if (s.isPopulateReference(node)) {
			//
		} else if (s.isTraverseReference(node)) {
			//
		}
	}

	if (result instanceof Scalar && s.isReference(result)) {
		return getReference.call(args.doc, result)
	} else if (u.isStr(result) && s.isReference(new Scalar(result))) {
		return getReference.call(args.doc, result)
	}

	return result
}
