import { Scalar } from 'yaml/types'
import regex from '../utils/regex'

export function getScalarValue(node: any) {
	return node instanceof Scalar ? node.value : node
}

export function isBoolean(node: any) {
	const value = getScalarValue(node)
	return [isBooleanTrue, isBooleanFalse].some((fn) => fn(value))
}

export function isBooleanTrue(node: any) {
	const value = getScalarValue(node)
	return value === 'true' || value === true
}

export function isBooleanFalse(node: any) {
	const value = getScalarValue(node)
	return value === 'false' || value === false
}

export function isContinue(node: Scalar) {
	return getScalarValue(node) === 'continue'
}

export function isReference(node: string | Scalar) {
	const value = getScalarValue(node)
	if (typeof value !== 'string') return false
	return (
		['.', '=', '@'].some((symb) => value.startsWith(symb)) ||
		['@'].some((symb) => value.endsWith(symb))
	)
}

export function isEvalReference(node: string | Scalar) {
	const value = getScalarValue(node)
	if (typeof value !== 'string') return false
	return regex.reference.eq.eval.test(value)
}

export function isLocalReference(node: string | Scalar) {
	const value = getScalarValue(node)
	if (typeof value !== 'string') return false
	return (
		regex.reference.dot.single.localRoot.test(value) ||
		regex.reference.dot.double.localRoot.test(value)
	)
}

export function isPopulateReference(node: string | Scalar) {
	const value = getScalarValue(node)
	if (typeof value !== 'string') return false
	return regex.reference.at.populate.test(value)
}

export function isRootReference(node: string | Scalar) {
	const value = getScalarValue(node)
	if (typeof value !== 'string') return false
	return (
		regex.reference.dot.single.root.test(value) ||
		regex.reference.dot.double.root.test(value)
	)
}

export function isTraverseReference(node: string | Scalar) {
	const value = getScalarValue(node)
	if (typeof value !== 'string') return false
	return regex.reference.underline.traverse.test(value)
}

export function startsWith(value: string, node: string | Scalar) {
	const val = getScalarValue(node)
	if (typeof val !== 'string') return false
	return val.startsWith(value)
}

export function endsWith(value: string, node: string | Scalar) {
	const val = getScalarValue(node)
	if (typeof val !== 'string') return false
	return val.endsWith(value)
}

export function getPreparedKeyForDereference(node: string | Scalar) {
	let value = getScalarValue(node)
	if (typeof value !== 'string') return false
	if (isLocalReference(value) || isRootReference(value)) {
		value = value.trim()
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
	return value
}
