import type { LiteralUnion } from 'type-fest'
import * as u from '@jsmanifest/utils'
import * as nu from 'noodl-utils'
import * as nt from 'noodl-types'
import {
	Document as YAMLDocument,
	Pair,
	Scalar,
	YAMLMap,
	YAMLSeq,
	isNode,
	isDocument,
	isScalar,
	isPair,
	isMap,
	isSeq,
	parse,
	parseDocument,
	visit,
} from 'yaml'
import type { Node as YAMLNode, visitor, visitorFn } from 'yaml'
import NoodlReference from '../Reference.js'

export {
	Pair,
	Scalar,
	YAMLNode,
	YAMLDocument,
	YAMLMap,
	YAMLSeq,
	isNode,
	isDocument,
	isScalar,
	isPair,
	isMap,
	isSeq,
	parse,
	parseDocument,
	visit,
	visitor,
	visitorFn,
}

const is = nt.Identify

export function toYAML(value: any, options?: Parameters<typeof parse>[1]) {
	return parse(value, {
		logLevel: 'warn',
		schema: 'core',
		version: '1.2',
		...options,
	})
}

export function toDocument(
	value: any,
	options?: Parameters<typeof parseDocument>[1],
) {
	return parseDocument(value, {
		logLevel: 'warn',
		schema: 'core',
		version: '1.2',
		...options,
	})
}

export function getKeys<V = any>(value: V): string[] {
	if (u.isArr(value)) {
		return value.map((val) => {
			if (isNode(val)) {
				if (isScalar(val)) return val.toString()
			}
			return val
		})
	}
}

export function getReferenceNodes(
	root: Record<string, YAMLNode>,
	value: LiteralUnion<nt.ReferenceString, string>,
) {
	const datapath = nu.toDataPath(nu.trimReference(value))
	const nodes = [] as NoodlReference[]

	let currKey = datapath.shift()
	let last: NoodlReference | null = null
	let rootKey = ''

	nodes.push(new NoodlReference(currKey))

	if (is.rootKey(currKey)) {
		rootKey = currKey
	}

	while (currKey) {
		let prevLast = last

		if (u.isStr(currKey)) {
			if (is.reference(currKey)) {
				//
			} else {
				let refNode: NoodlReference | null = null

				if (is.rootKey(currKey)) {
					//
				} else {
					refNode = new NoodlReference(currKey, rootKey)
				}

				if (refNode instanceof NoodlReference) {
					nodes.push(refNode)
					last = refNode
				}
			}
		} else if (u.isNum(currKey)) {
			last = new NoodlReference(currKey, rootKey)
			nodes.push(last)
		}

		if (prevLast !== last) {
			//
		}

		currKey = datapath.shift()
	}

	return nodes
}
