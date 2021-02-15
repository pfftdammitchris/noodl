import { Scalar } from 'yaml/types'
import regex from '../utils/regex'

export function isBoolean(node: Scalar) {
	return isBooleanTrue(node) || isBooleanFalse(node)
}

export function isBooleanTrue(node: Scalar) {
	return node.value === 'true' || node.value === true
}

export function isBooleanFalse(node: Scalar) {
	return node.value === 'false' || node.value === false
}

export function isContinue(node: Scalar) {
	return node.value === 'continue'
}

export function isReference(node: Scalar) {
	if (typeof node.value !== 'string') return false
	return (
		['.', '=', '@'].some((symb) => node.value.startsWith(symb)) ||
		['@'].some((symb) => node.value.endsWith(symb))
	)
}

export function isEvalReference(node: Scalar) {
	return typeof node.value === 'string'
		? regex.reference.eq.eval.test(node.value)
		: false
}

export function isLocalReference(node: Scalar) {
	if (typeof node.value !== 'string') return false
	return (
		regex.reference.dot.single.localRoot.test(node.value) ||
		regex.reference.dot.double.localRoot.test(node.value)
	)
}

export function isPopulateReference(node: Scalar) {
	return typeof node.value === 'string'
		? regex.reference.at.populate.test(node.value)
		: false
}

export function isRootReference(node: Scalar) {
	if (typeof node.value !== 'string') return false
	return (
		regex.reference.dot.single.root.test(node.value) ||
		regex.reference.dot.double.root.test(node.value)
	)
}

export function isTraverseReference(node: Scalar) {
	return typeof node.value === 'string'
		? regex.reference.underline.traverse.test(node.value)
		: false
}

export function startsWith(value: string, node: Scalar) {
	return typeof node.value === 'string' && node.value.startsWith(value)
}

export function endsWith(value: string, node: Scalar) {
	return typeof node.value === 'string' && node.value.endsWith(value)
}

export function getPreparedKeyForDereference(node: Scalar) {
	if (typeof node.value !== 'string') return ''
	if (isLocalReference(node) || isRootReference(node)) {
		const value = node.value.trim()
		if (value.startsWith('..')) {
			return value === '..' ? '' : value.replace('..', '')
		} else if (value.startsWith('.')) {
			return value === '.' ? '' : value.substring(1)
		}
	} else if (isPopulateReference(node)) {
		//
	} else if (isTraverseReference(node)) {
		//
	}
	return node.value
}
