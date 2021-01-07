import { isReference } from 'noodl-utils'
import {
	forEachDeepKeyValue,
	hasAllKeys,
	hasAnyKeys,
	hasKey,
	hasKeyEqualTo,
	isImg,
	isJs,
	isHtml,
	isPdf,
	isVid,
	onPair,
	onScalar,
	onYAMLMap,
	onYAMLSeq,
	sortObjPropsByKeys,
} from '../utils/common'

export const identify = (function () {
	function composeFilters<N>(...fns: ((node: N) => boolean)[]) {
		fns = fns.reverse()
		return (node: unknown) => fns.every((fn) => fn(node as N))
	}

	const o = {
		id: 'identify',
		action: {
			any: onYAMLMap(composeFilters(hasKey('actionType'))),
			builtIn: onYAMLMap(
				composeFilters(
					hasAllKeys(['actionType', 'funcName']),
					hasKeyEqualTo('actionType', 'builtIn'),
				),
			),
			evalObject: onYAMLMap(
				composeFilters(hasKeyEqualTo('actionType', 'evalObject')),
			),
			pageJump: onYAMLMap(
				composeFilters(hasKeyEqualTo('actionType', 'pageJump')),
			),
			popUp: onYAMLMap(composeFilters(hasKeyEqualTo('actionType', 'popUp'))),
			popUpDismiss: onYAMLMap(
				composeFilters(hasKeyEqualTo('actionType', 'popUpDismiss')),
			),
			refresh: onYAMLMap(
				composeFilters(hasKeyEqualTo('actionType', 'refresh')),
			),
			saveObject: onYAMLMap(
				composeFilters(hasKeyEqualTo('actionType', 'saveObject')),
			),
			updateObject: onYAMLMap(
				composeFilters(hasKeyEqualTo('actionType', 'updateObject')),
			),
		},
		actionChain: onYAMLSeq((node) =>
			node.items.some(onYAMLMap(hasAnyKeys(['actionType', 'emit', 'goto']))),
		),
		component: {
			any: onYAMLMap(
				composeFilters(hasAnyKeys(['style', 'children']), hasKey('type')),
			),
			button: onYAMLMap(composeFilters(hasKeyEqualTo('type', 'button'))),
			divider: onYAMLMap(composeFilters(hasKeyEqualTo('type', 'divider'))),
			image: onYAMLMap(composeFilters(hasKeyEqualTo('type', 'image'))),
			label: onYAMLMap(composeFilters(hasKeyEqualTo('type', 'label'))),
			list: onYAMLMap(composeFilters(hasKeyEqualTo('type', 'list'))),
			listItem: onYAMLMap(composeFilters(hasKeyEqualTo('type', 'listItem'))),
			popUp: onYAMLMap(composeFilters(hasKeyEqualTo('type', 'popUp'))),
			scrollView: onYAMLMap(
				composeFilters(hasKeyEqualTo('type', 'scrollView')),
			),
			select: onYAMLMap(composeFilters(hasKeyEqualTo('type', 'select'))),
			textField: onYAMLMap(composeFilters(hasKeyEqualTo('type', 'textField'))),
			textView: onYAMLMap(composeFilters(hasKeyEqualTo('type', 'textView'))),
			view: onYAMLMap(composeFilters(hasKeyEqualTo('type', 'view'))),
		},
		emit: onYAMLMap(composeFilters(hasKey('emit'))),
		if: onYAMLMap(composeFilters(hasKey('if'))),
		keyValue: {
			actionType: onPair((node) => node.key.value === 'actionType'),
			funcName: onPair((node) => node.key.value === 'funcName'),
		},
		scalar: {
			reference: onScalar((node) => isReference(node.value)),
			url: onScalar(
				(node) =>
					typeof node.value === 'string' &&
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
					hasAnyKeys([
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
				any: onPair((node) => node.key.value === 'style'),
			},
			textAlign: onPair((node) => /textAlign/i.test(node.key.value)),
			textBoard: onPair((node) => /textBoard/i.test(node.key.value)),
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
		getKeyCounts({
			keys,
			objs,
		}: {
			objs: any
			keys?: string | string[]
		}): { [key: string]: number } {
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
