import get from 'lodash/get'
import has from 'lodash/has'
import { NameField } from '../ecosTypes'

export function excludeKeys(keys1: string[], keys2: string | string[]) {
	const targetKeys = Array.isArray(keys2) ? keys2 : [keys2]
	return keys1.filter((k) => !targetKeys.includes(k))
}

export function exists(v: unknown) {
	return !isNil(v)
}

export function hasKey(key: string, value: any) {
	return has(value, key)
}

export function hasKeyEqualTo(key: string, value: any) {
	return has(value, key) && get(value, key) === value
}
export function hasAllKeys(keys: string | string[]) {
	return (value: Record<string, any>) =>
		(Array.isArray(keys) ? keys : [keys]).every((k) => k in (value || {}))
}

export function hasInAllKeys(keys: string | string[]) {
	return (value: Record<string, any>) =>
		(Array.isArray(keys) ? keys : [keys]).every((k) => has(value, k))
}

export function hasMinimumKeys(
	keys: string | string[],
	min: number,
	value: Record<string, any>,
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

export function hasNameField<
	O extends Record<string, any> = Record<string, any>,
>(v: O | undefined): v is O & { name: NameField } {
	return isObj(v) && 'name' in v && isObj(v.name)
}

export function hasAnyKeys(
	keys: string | string[],
	value: Record<string, any>,
) {
	return (Array.isArray(keys) ? keys : [keys]).some((k) => k in value)
}

export function hasInAnyKeys(
	keys: string | string[],
	value: Record<string, any>,
) {
	return (Array.isArray(keys) ? keys : [keys]).some((k) => has(value, k))
}

export function isArr(v: unknown): v is any[] {
	return Array.isArray(v)
}

export function isBool(value: unknown): value is Boolean {
	return typeof value === 'boolean'
}

export function isNil(v: unknown) {
	return v === null || typeof v === 'undefined'
}

export function isObj(value: unknown): value is Record<string, any> {
	return value != null && !isArr(value) && typeof value === 'object'
}

export function isImg(s: string) {
	return /([a-z\-_0-9\/\:\.]*\.(jpg|jpeg|png|gif))/i.test(s)
}

export function isPdf(s: string) {
	return s.endsWith('.pdf')
}

export function isVid(s: string) {
	return /([a-z\-_0-9\/\:\.]*\.(mp4|avi|wmv))/i.test(s)
}

export function isYml(s: string = '') {
	return s.endsWith('.yml')
}

export function isJson(s: string = '') {
	return s.endsWith('.json')
}

export function isJs(s: string = '') {
	return s.endsWith('.js')
}

export function isHtml(s: string = '') {
	return s.endsWith('.html')
}

export function isStr(v: unknown): v is string {
	return typeof v === 'string'
}

export const Regex = (function () {
	const o = {
		reference: {
			dot: {
				single: {
					root: /(^\.[A-Z])/,
					localRoot: /(^\.[a-z])/,
				},
				double: {
					root: /(^\.\.[A-Z])/,
					localRoot: /(^\.\.[a-z])/,
				},
			},
		},
	}
	return o
})()
