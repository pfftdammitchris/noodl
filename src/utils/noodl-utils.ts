import isPlainObject from 'lodash/isPlainObject'
import yaml from 'yaml'
import { Pair, Scalar, YAMLMap, YAMLSeq } from 'yaml/types'

function isYamlNode(type: 'pair', node: any): node is Pair
function isYamlNode(type: 'scalar', node: any): node is Scalar
function isYamlNode(type: 'map', node: any): node is YAMLMap
function isYamlNode(type: 'seq', node: any): node is YAMLSeq
function isYamlNode(type: string, node: any) {
	if (node) {
		switch (type) {
			case 'map':
				return node instanceof YAMLMap
			case 'scalar':
				return node instanceof Scalar
			case 'pair':
				return node instanceof Pair
			case 'seq':
				return node instanceof YAMLSeq
		}
	}
	return false
}

export function isDataKeyObj(node: unknown) {
	if (isYamlNode('map', node)) {
	}
	return false
}

export interface IdentifierStore {
	identified: any[]
	unidentified: any[]
	partial: any[]
}

// Node has to be a YAMLMap
function createPathIdentifier(paths: string[][]): (node: any) => boolean
function createPathIdentifier(paths: string[]): (node: any) => boolean
function createPathIdentifier(paths: string): (node: any) => boolean
function createPathIdentifier(
	fn: (util: {
		required: <V extends string | number>(val: V[]) => V[]
	}) => string | string[] | string[][],
): (node: any) => boolean
function createPathIdentifier(paths: any) {
	let pathsList = [] as { paths: string[]; required?: boolean }[]

	const toPath = (
		v: (string | number) | (string | number)[],
		required?: boolean,
	): string[] => ({
		path: Array.isArray(v) ? v.map(String) : [String(v)],
		required: !!required,
	})

	const toPaths = (
		p: any,
		required?: boolean,
	): { paths: string[]; required: boolean }[][] => {
		if (Array.isArray(p)) {
			if (Array.isArray(p[0])) return toPath(p, required)
			return p.map((v) => toPath(v)) as any
		}
		return [[p]].map((v) => v.map(toPath))
	}

	const required = (val: (string | number)[]) => {
		toPaths(val).forEach((paths) => {
			pathsList
		})
		return result
	}

	if (typeof paths === 'function') {
		pathsList = pathsList.concat(toPaths(paths({ required })))
	} else {
		pathsList = pathsList.concat(toPaths(paths))
	}

	return (node: any) => {
		if (!node || !(node instanceof YAMLMap)) return false
		const passes = requiredPathsList.concat(pathsList).every((p) => {
			let isReq = requiredPathsList.includes(p)
			const exists = node.hasIn(p)
			if (!exists && isReq) return false
			return true
		})
		if (passes) return node instanceof YAMLMap
		return false
	}
}

export function isEmitObj(node: unknown) {
	return createPathIdentifier(({ required }) => [
		['emit', 'dataKey'],
		required(['emit', 'actions']),
	])(node)
}
