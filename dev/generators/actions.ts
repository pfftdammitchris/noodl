// @ts-nocheck
import * as u from '@jsmanifest/utils'
import { Identify } from 'noodl-types'
import flowRight from 'lodash/flowRight'
import yaml from 'yaml'
import { data as stats } from '../morph'
import visit from '../visit'
import * as t from '../types'

export const handleActionType: t.NoodlVisitFn<yaml.Pair> = ({
	name,
	doc,
	data,
	node,
}) => {
	if (yaml.isScalar(node.key) && node.key.value === 'actionType') {
		let actionType = (node.value as yaml.Scalar).value as string
		let stats = data.actionTypes[actionType]

		if (!stats) {
			stats = {
				occurrences: 0,
				pages: { [name]: { occurrences: 1, values: [] } },
				totalPages: 1,
			} as typeof data['actionTypes'][string]
			data.actionTypes[actionType] = stats
		}

		!('occurrences' in stats) && (stats.occurrences = 0)
		!('pages' in stats) && (stats.pages = {})
		!('totalPages' in stats) && (stats.totalPages = 0)

		stats.occurrences++

		if (!stats.pages[name]) {
			stats.pages[name] = { occurrences: 0, values: [] }
			stats.totalPages++
		}

		!('occurrences' in stats.pages[name]) && (stats.pages[name].occurrences = 0)
		!('values' in stats.pages[name]) && (stats.pages[name].values = [])

		stats.pages[name].occurrences++
		stats.pages[name].values.push({
			wrappedBy: null,
		})
	}
}

export const handleActionProperty: t.NoodlVisitFn<yaml.YAMLMap> = ({
	name,
	data,
	node,
}) => {
	if (node.has('actionType')) {
		for (const item of node.items) {
			if (yaml.isScalar(item.key)) {
				let key = item.key.value as string
				let stats = data.actionProperties[key]
				let value: any

				if (yaml.isScalar(item.value)) value = item.value.value
				else if (yaml.isSeq(item.value)) value = item.value.toJSON()
				else if (yaml.isMap(item.value)) value = item.value.toJSON()

				if (!stats) {
					stats = {} as typeof data.actionProperties[string]
					data.actionProperties[key] = stats
				}

				if (!('isReference' in stats)) {
					stats.isReference = Identify.reference(key)
				}

				if (!('occurrences' in stats)) {
					stats.occurrences = 0
				}

				if (!('pages' in stats)) {
					stats.pages = {}
				}

				if (!('totalPages' in stats)) {
					stats.totalPages = 0
				}

				if (!('values' in stats)) {
					stats.values = []
				}

				if (!stats.pages[name]) {
					stats.pages[name] = {} as typeof stats.pages[string]
					stats.totalPages++
				}

				if (!('occurrences' in stats.pages[name])) {
					stats.pages[name].occurrences = 0
				}

				const valueObject = {
					page: name,
					value,
				} as typeof stats.values[number]

				if (u.isStr(value)) {
					// valueObject.isAsset = Identify.reference(value)
					valueObject.isBoolean = Identify.isBoolean(value)
					valueObject.isReference = Identify.reference(value)

					if (value.startsWith('http')) {
						const url = new URL(value)
						valueObject.isAbsoluteUrl = !!(url.protocol && url.origin)
					}
				} else if (u.isArr(value)) {
					valueObject.isActionChain = Identify.actionChain(value)
				} else if (u.isObj(value)) {
					valueObject.isEmit = Identify.folds.emit(value)
					valueObject.isGoto = Identify.folds.goto(value)
					valueObject.isToast = Identify.folds.toast(value)

					const keys = u.keys(value)

					if (keys.length) {
						for (const valueKey of keys) {
							if (Identify.reference(valueKey)) {
								let refObject = {} as typeof valueObject.references

								if (!refObject) {
									refObject = {} as typeof valueObject.references
									valueObject.references = refObject
								}

								if (!('total' in refObject)) {
									refObject.total = 0
								}

								if (!('values' in refObject)) {
									refObject.values = []
								}

								refObject.total++
								refObject.values.push({ value: valueKey })
							}
						}
					}
				}

				stats.occurrences++
				stats.pages[name].occurrences++
				stats.values.push(valueObject)
			}
		}
	}
}

const aggregateActions = function aggregateActions({
	name = '',
	doc,
	data,
}: {
	name: string
	doc: yaml.Document
	data: typeof stats
}) {
	yaml.visit(doc, {
		Scalar: visit({ name, doc, data }, flowRight()),
		Pair: visit({ name, doc, data }, flowRight()),
		Map: visit({ name, doc, data }, flowRight(handleActionProperty)),
		Seq: visit({ name, doc, data }, flowRight()),
	})
}

export default aggregateActions
