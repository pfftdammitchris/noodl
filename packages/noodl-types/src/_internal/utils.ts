import has from 'lodash/has'
import { PlainObject } from './types'

export function excludeKeys(keys1: string[], keys2: string | string[]) {
	const targetKeys = Array.isArray(keys2) ? keys2 : [keys2]
	return keys1.filter((k) => !targetKeys.includes(k))
}

export function exists(v: unknown) {
	return !isNil(v)
}

export function hasAllKeys(keys: string | string[], value: PlainObject) {
	return (Array.isArray(keys) ? keys : [keys]).every((k) => k in value)
}

export function hasInAllKeys(keys: string | string[], value: PlainObject) {
	return (Array.isArray(keys) ? keys : [keys]).every((k) => has(value, k))
}

export function hasMinimumKeys(
	keys: string | string[],
	min: number,
	value: PlainObject,
) {
	const occurrences = [] as string[]
	const keyz = Array.isArray(keys) ? keys : [keys]
	const numKeyz = keyz.length
	let count = 0
	for (let index = 0; index < numKeyz; index++) {
		const key = keyz[index]
		if (key in value && !occurrences.includes(key)) {
			count++
			occurrences.push(key)
		}
		if (count >= min) return true
	}
	return false
}

export function hasAnyKeys(keys: string | string[], value: PlainObject) {
	return (Array.isArray(keys) ? keys : [keys]).some((k) => k in value)
}

export function hasInAnyKeys(keys: string | string[], value: PlainObject) {
	return (Array.isArray(keys) ? keys : [keys]).some((k) => has(value, k))
}

export function isNil(v: unknown) {
	return v === null || typeof v === 'undefined'
}

export function isPlainObject(value: unknown): value is PlainObject {
	return exists(value) && !Array.isArray(value) && typeof value === 'object'
}
