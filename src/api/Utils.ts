import { Pair } from 'yaml'
import * as u from '@jsmanifest/utils'
import { isReference } from 'noodl-utils'
import partialRight from 'lodash/partialRight'
import {
	forEachDeepKeyValue,
	isImg,
	isJs,
	isHtml,
	isPdf,
	isVid,
	sortObjPropsByKeys,
} from '../utils/common'
import {
	hasAllKeys,
	hasAnyKeys,
	hasKey,
	hasKeyEqualTo,
	onPair,
	onScalar,
	onYAMLMap,
	onYAMLSeq,
} from '../utils/doc'

export const identify = (function () {
	function composeFilters<N>(...fns: ((node: N) => boolean)[]) {
		fns = fns.reverse()
		return (node: unknown) => fns.every((fn) => fn(node as N))
	}

	const o = {
		action: {
			any: onYAMLMap(composeFilters(partialRight(hasKey, 'actionType'))),
			builtIn: onYAMLMap(
				composeFilters(
					partialRight(hasAllKeys, ['actionType', 'funcName']),
					partialRight(hasKeyEqualTo, 'actionType', 'builtIn'),
				),
			),
			evalObject: onYAMLMap(
				composeFilters(partialRight(hasKeyEqualTo, 'actionType', 'evalObject')),
			),
			pageJump: onYAMLMap(
				composeFilters(partialRight(hasKeyEqualTo, 'actionType', 'pageJump')),
			),
			popUp: onYAMLMap(
				composeFilters(partialRight(hasKeyEqualTo, 'actionType', 'popUp')),
			),
			popUpDismiss: onYAMLMap(
				composeFilters(
					partialRight(hasKeyEqualTo, 'actionType', 'popUpDismiss'),
				),
			),
			refresh: onYAMLMap(
				composeFilters(partialRight(hasKeyEqualTo, 'actionType', 'refresh')),
			),
			saveObject: onYAMLMap(
				composeFilters(partialRight(hasKeyEqualTo, 'actionType', 'saveObject')),
			),
			updateObject: onYAMLMap(
				composeFilters(
					partialRight(hasKeyEqualTo, 'actionType', 'updateObject'),
				),
			),
		},
		actionChain: onYAMLSeq((node) =>
			node.items.some(
				onYAMLMap(partialRight(hasAnyKeys, ['actionType', 'emit', 'goto'])),
			),
		),
		component: {
			any: onYAMLMap(
				composeFilters(
					partialRight(hasAnyKeys, ['style', 'children']),
					partialRight(hasKey, 'type'),
				),
			),
			button: onYAMLMap(
				composeFilters(partialRight(hasKeyEqualTo, 'type', 'button')),
			),
			divider: onYAMLMap(
				composeFilters(partialRight(hasKeyEqualTo, 'type', 'divider')),
			),
			image: onYAMLMap(
				composeFilters(partialRight(hasKeyEqualTo, 'type', 'image')),
			),
			label: onYAMLMap(
				composeFilters(partialRight(hasKeyEqualTo, 'type', 'label')),
			),
			list: onYAMLMap(
				composeFilters(partialRight(hasKeyEqualTo, 'type', 'list')),
			),
			listItem: onYAMLMap(
				composeFilters(partialRight(hasKeyEqualTo, 'type', 'listItem')),
			),
			page: onYAMLMap(
				composeFilters(partialRight(hasKeyEqualTo, 'type', 'page')),
			),
			popUp: onYAMLMap(
				composeFilters(partialRight(hasKeyEqualTo, 'type', 'popUp')),
			),
			scrollView: onYAMLMap(
				composeFilters(partialRight(hasKeyEqualTo, 'type', 'scrollView')),
			),
			select: onYAMLMap(
				composeFilters(partialRight(hasKeyEqualTo, 'type', 'select')),
			),
			textField: onYAMLMap(
				composeFilters(partialRight(hasKeyEqualTo, 'type', 'textField')),
			),
			textView: onYAMLMap(
				composeFilters(partialRight(hasKeyEqualTo, 'type', 'textView')),
			),
			view: onYAMLMap(
				composeFilters(partialRight(hasKeyEqualTo, 'type', 'view')),
			),
		},
		emit: onYAMLMap(composeFilters(partialRight(hasKey, 'emit'))),
		if: onYAMLMap(composeFilters(partialRight(hasKey, 'if'))),
		keyValue: {
			actionType: onPair(
				(node: Pair<any, any>) => node.key.value === 'actionType',
			),
			funcName: onPair((node: Pair<any, any>) => node.key.value === 'funcName'),
		},
		scalar: {
			reference: onScalar((node) => isReference(node.value)),
			url: onScalar(
				(node) =>
					u.isStr(node.value) &&
					!node.value.startsWith('.') &&
					(isImg(node.value) ||
						isJs(node.value) ||
						isHtml(node.value) ||
						isPdf(node.value) ||
						isVid(node.value)),
			),
		},
		style: {
			any: onYAMLMap(
				composeFilters(
					partialRight(hasAnyKeys, [
						'align',
						'axis',
						'backgroundColor',
						'border',
						'color',
						'width',
						'height',
						'left',
						'letterSpacing',
						'top',
						'fontSize',
						'fontFamily',
						'required',
						'textAlign',
						'',
					]),
				),
			),
			border: onYAMLMap(
				(node) =>
					typeof node.get('style') === 'string' ||
					typeof node.get('style') === 'number',
			),
		},
		paths: {
			style: {
				any: onPair((node: Pair<any, any>) => node.key.value === 'style'),
			},
			textAlign: onPair((node: Pair<any, any>) =>
				/textAlign/i.test(node.key.value),
			),
			textBoard: onPair((node: Pair<any, any>) =>
				/textBoard/i.test(node.key.value),
			),
		},
	}

	return o
})()

const Utils = (function () {
	const o = {
		actionTypes() {},
		objectsThatContainKeys({
			name = '',
			keys,
			objs,
		}: {
			name?: string
			keys: string | string[]
			objs: any
		}) {
			const keywords = Array.isArray(keys) ? keys : [keys]
			const results = {
				name,
				keywords,
				results: keywords.reduce(
					(acc, keyword) => Object.assign(acc, { [keyword]: [] }),
					{},
				),
			}
			forEachDeepKeyValue(
				(key, value, obj) =>
					keywords.includes(key) && (results.results as any)[key].push(obj),
				objs,
			)
			return results
		},
		getKeyCounts({ keys, objs }: { objs: any; keys?: string | string[] }): {
			[key: string]: number
		} {
			const keywords = Array.isArray(keys) ? keys : (keys && [keys]) || []
			const results = {} as { [key: string]: number }
			forEachDeepKeyValue((key, value, obj) => {
				if (keywords.length) {
					if (keywords.includes(key)) {
						if (typeof results[key] !== 'number') results[key] = 0
						results[key]++
					}
				} else {
					if (typeof results[key] !== 'number') results[key] = 0
					results[key]++
				}
			}, objs)
			return sortObjPropsByKeys(results)
		},
	}

	return o as typeof o & { identify: typeof identify }
})()

Utils.identify = identify

export default Utils
