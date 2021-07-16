import * as u from '@jsmanifest/utils'
import flowRight from 'lodash/flowRight'
import curry from 'lodash/curry'
import yaml, { isDocument, isMap, Pair, Scalar, YAMLMap, YAMLSeq } from 'yaml'
import { placeholder } from '../constants'

export function has(path: string[], node: unknown): boolean
export function has(path: string, node: unknown): boolean
export function has(path: string | string[] | string[][], node: unknown) {
	if (isYAMLNode('map', node)) {
		if (u.isStr(path)) {
			return node.hasIn(path.split('.'))
		} else if (u.isArr(path)) {
			return node.hasIn(path)
		}
	}
	return false
}

export const hasNoodlPlaceholder = (function () {
	const regex = new RegExp(`(${u.values(placeholder).join('|')})`, 'i')
	function hasPlaceholder(str: string | undefined) {
		return u.isStr(str) ? regex.test(str) : false
	}
	return hasPlaceholder
})()

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

export function isValidAsset(value: string | undefined) {
	if (value?.endsWith('..tar')) return false
	return u.isStr(value) && /(.[a-zA-Z]+)$/i.test(value)
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

export function createPlaceholderReplacer(
	placeholders: string | string[],
	flags?: string,
) {
	const regexp = new RegExp(
		(u.isArr(placeholders) ? placeholders : [placeholders]).reduce(
			(str, placeholder) => str + (!str ? placeholder : `|${placeholder}`),
			'',
		),
		flags,
	)
	function replace(str: string, value: string | number): string
	function replace<Obj extends {} = any>(obj: Obj, value: string | number): Obj
	function replace<Obj extends {} = any>(
		str: string | Obj,
		value: string | number,
	) {
		if (u.isStr(str)) {
			return str.replace(regexp, String(value))
		} else if (u.isObj(str)) {
			const stringified = JSON.stringify(str).replace(regexp, String(value))
			return JSON.parse(stringified)
		}
		return ''
	}
	return replace
}

export const replaceBaseUrlPlaceholder = createPlaceholderReplacer(
	'\\${cadlBaseUrl}',
	'gi',
)

export const replaceDesignSuffixPlaceholder = createPlaceholderReplacer(
	'\\${designSuffix}',
	'gi',
)

export const replaceTildePlaceholder = createPlaceholderReplacer('~/')

export const replaceVersionPlaceholder = createPlaceholderReplacer(
	'\\${cadlVersion}',
	'gi',
)

export const createNoodlPlaceholderReplacer = (function () {
	const replaceCadlBaseUrl = curry(replaceBaseUrlPlaceholder)
	const replaceCadlVersion = curry(replaceVersionPlaceholder)
	const replaceDesignSuffix = curry(replaceDesignSuffixPlaceholder)
	const replacerMapper = {
		cadlVersion: replaceCadlVersion,
		designSuffix: replaceDesignSuffix,
		cadlBaseUrl: replaceCadlBaseUrl,
	}
	const createReplacer = (keyMap: {
		cadlBaseUrl?: any
		cadlVersion?: any
		designSuffix?: any
	}) => {
		const replacers = [] as ((s: string) => string)[]
		const entries = u.entries(keyMap)

		if (keyMap.cadlBaseUrl && 'cadlVersion' in keyMap) {
			keyMap.cadlBaseUrl = replaceCadlBaseUrl(
				keyMap.cadlBaseUrl,
				keyMap.cadlVersion,
			)
		}

		for (let index = 0; index < entries.length; index++) {
			const [placeholder, value] = entries[index]
			if (placeholder in replacerMapper) {
				const regexStr = '\\${' + placeholder + '}'
				const regex = new RegExp(regexStr, 'gi')
				replacers.push((s: string) => s.replace(regex, value))
			}
		}
		return flowRight(...replacers)
	}
	return createReplacer
})()
