import * as u from '@jsmanifest/utils'
import yaml, { isDocument, isMap, Pair, Scalar, YAMLMap, YAMLSeq } from 'yaml'

export function has(path: string[], node: unknown): boolean
export function has(path: string, node: unknown): boolean
export function has(path: string | string[] | string[][], node: unknown) {
	if (isYAMLNode('map', node)) {
		if (typeof path === 'string') {
			return node.hasIn(path.split('.'))
		} else if (Array.isArray(path)) {
			return node.hasIn(path)
		}
	}
	return false
}

export function hasPaths(
	opts: { paths?: string[][]; required?: string[][] },
	node: unknown,
): boolean
export function hasPaths(paths: string[][], node: unknown): boolean
export function hasPaths(paths: any, node: unknown) {
	if (isYAMLNode('map', node)) {
		if (u.isObj(paths)) {
			const required = paths.required
			paths = paths.paths
			if (required?.length) {
				if (required.every((path: string[]) => node.hasIn(path))) {
					return true
				} else {
					// As a fallback we can still assume true if it has at least these paths:
					return paths.every((path: string[]) => node.hasIn(path))
				}
			} else {
				return paths.every((path: string[]) => node.hasIn(path))
			}
		} else if (Array.isArray(paths)) {
			return paths.every((p: string[]) => node.hasIn(p))
		}
	}
	return false
}

export function isActionObj(node: YAMLMap) {
	return has('actionType', node)
}

export function isBuiltInObj(node: YAMLMap) {
	return node.get('actionType') === 'builtIn'
}

export function isComponentObj(node: YAMLMap) {
	return has('type', node)
}

export function isEmitObj(node: YAMLMap) {
	return has('emit', node)
}

export function isIfObj(node: YAMLMap) {
	return has('if', node)
}

export function isPageDocument(node: unknown): node is yaml.Document<YAMLMap> {
	return (
		isDocument(node) && isMap(node.contents) && node.contents.items.length === 1
	)
}

export function isYAMLNode(type: 'pair', node: any): node is Pair
export function isYAMLNode(type: 'scalar', node: any): node is Scalar
export function isYAMLNode(type: 'map', node: any): node is YAMLMap
export function isYAMLNode(type: 'seq', node: any): node is YAMLSeq
export function isYAMLNode(type: string, node: any) {
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
