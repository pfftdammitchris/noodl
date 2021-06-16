import * as u from '@jsmanifest/utils'
import { isLocalReference, isRootReference } from 'noodl'
import yaml from 'yaml'
import Aggregator from 'noodl-aggregator'

export function trimReferencePrefix(value: string | undefined = '') {
	if (value.startsWith('..')) return value.substring(2)
	else if (value.startsWith('.')) return value.substring(1)
	else if (value.startsWith('=')) return value.substring(1)
	else if (value.startsWith('@')) return value.substring(1)
	return value
}

export function parseReference(
	this: yaml.Document,
	node: yaml.Scalar<string>,
	root?: Aggregator['root'],
) {
	const result = {}
	const path = trimReferencePrefix(node.value)
	let value: any

	if (isLocalReference(node)) {
		value = this.getIn(path.split('.'))
	} else if (isRootReference(node)) {
		const [rootKey, ...localPaths] = path.split('.')
		value = root.get(rootKey)
		if (yaml.isDocument(value)) {
			value = localPaths.length ? value.getIn(localPaths) : value.contents
		}
	} else if (node.value.startsWith('=')) {
		//
	} else if (node.value.startsWith('@')) {
		//
	}

	return result
}
