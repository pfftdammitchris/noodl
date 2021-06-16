import * as u from '@jsmanifest/utils'
import { Identify } from 'noodl-types'
import { isScalar, Scalar } from 'yaml'
import regex from '../internal/regex'

export function getScalarValue(node: any) {
	return node instanceof Scalar ? node.value : node
}

export function isBoolean(node: any): boolean {
	const value = getScalarValue(node)
	return [isBooleanTrue, isBooleanFalse].some((fn) => fn(value))
}

export function isBooleanTrue(node: any): boolean {
	const value = getScalarValue(node)
	return value === 'true' || value === true
}

export function isBooleanFalse(node: any): boolean {
	const value = getScalarValue(node)
	return value === 'false' || value === false
}

export function isContinue(node: Scalar) {
	return node.value === 'continue'
}

export function isNumber(node: Scalar): boolean {
	return u.isNum(node.value)
}

export function isString(node: Scalar): boolean {
	return u.isStr(node.value)
}

export function isReference(node: Scalar): boolean {
	return Identify.reference(node.value)
}

export function isLocalReference(node: Scalar): boolean {
	return u.isStr(node.value) && node.value.startsWith('..')
}

export function isRootReference(node: Scalar): boolean {
	return (
		isScalar(node) &&
		!isLocalReference(node) &&
		u.isStr(node.value) &&
		node.value.startsWith('.')
	)
}

export function isEvalReference(node: string | Scalar) {
	const value = getScalarValue(node)
	if (typeof value !== 'string') return false
	return value.startsWith('=')
}

export function isTraverseReference(node: string | Scalar) {
	const value = getScalarValue(node)
	if (typeof value !== 'string') return false
	return regex.reference.underline.traverse.test(value)
}

export function startsWith(value: string | undefined, node: Scalar) {
	return isString(node) && node.value.startsWith(value || '')
}

export function endsWith(value: string | undefined, node: Scalar) {
	return isString(node) && node.value.endsWith(value || '')
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
	}
	return value
}
