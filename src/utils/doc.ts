import flowRight from 'lodash/flowRight'
import { Node, isNode, Pair, Scalar, YAMLMap, YAMLSeq } from 'yaml'
import { IdentifyFn } from '../types'

export function composeScalarFns<RT = any>(...fns: ((n: Scalar<any>) => RT)[]) {
	return onScalar(flowRight(...fns))
}

export function composePairFns<RT = any>(
	...fns: ((n: Pair<any, any>) => RT)[]
) {
	return onPair(flowRight(...fns))
}

export function composeMapFns<RT = any>(
	...fns: ((n: YAMLMap<any, any>) => RT)[]
) {
	return onYAMLMap(flowRight(...fns))
}

export function composeSeqFns<RT = any>(...fns: ((n: YAMLSeq<any>) => RT)[]) {
	return onYAMLSeq(flowRight(...fns))
}

export function composeSomes<N extends Node>(...fns: ((n: N) => boolean)[]) {
	return (node: N) => isNode(node) && fns.some((fn) => !!fn(node))
}

export function hasAllKeys(node: YAMLMap<any, any>, keys: string | string[]) {
	return (Array.isArray(keys) ? keys : [keys]).every((key) => node.has(key))
}

export function hasAnyKeys(node: YAMLMap<any, any>, keys: string | string[]) {
	return (Array.isArray(keys) ? keys : [keys]).some((key) => node.has(key))
}

export function hasKey(node: YAMLMap<any, any>, key: string) {
	return node.has(key)
}

export function hasKeyEqualTo(
	node: YAMLMap<any, any>,
	key: string,
	value: any,
) {
	return node.has(key) && node.get(key) === value
}

export function isYAMLMap(v: unknown): v is YAMLMap<any, any> {
	return v instanceof YAMLMap
}

export function isYAMLSeq(v: unknown): v is YAMLSeq<any> {
	return v instanceof YAMLSeq
}

export function isPair(v: unknown): v is Pair<any, any> {
	return v instanceof Pair
}

export function isScalar(v: unknown): v is Scalar<any> {
	return v instanceof Scalar
}

export function onYAMLMap(fn: IdentifyFn<YAMLMap<any, any>>) {
	return function (v: unknown): v is YAMLMap<any, any> {
		return isYAMLMap(v) && fn(v)
	}
}

export function onYAMLSeq(fn: IdentifyFn<YAMLSeq<any>>) {
	return function (v: unknown): v is YAMLSeq<any> {
		return isYAMLSeq(v) && fn(v)
	}
}

export function onPair(fn: IdentifyFn<Pair<any, any>>) {
	return function (v: unknown): v is Pair<any, any> {
		return isPair(v) && fn(v)
	}
}

export function onScalar(fn: IdentifyFn<Scalar<any>>) {
	return function (v: unknown): v is Scalar<any> {
		return isScalar(v) && fn(v)
	}
}
