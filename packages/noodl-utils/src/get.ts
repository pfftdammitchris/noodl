import * as u from '@jsmanifest/utils'
import * as nt from 'noodl-types'
import * as nu from 'noodl-utils'
import curry from 'lodash.curry'
import _get_ from 'lodash.get'

export type RootArg = Record<string, any> | (() => Record<string, any>)
export type PathItem = string | number

function isPathable(value: unknown): value is PathItem {
	return u.isStr(value) || u.isNum(value)
}

function keyExists(key: PathItem | undefined, obj: unknown) {
	if (key === undefined) return false
	if (u.isArr(obj) && isPathable(key)) return obj.indexOf(Number(key)) == key
	if (u.isObj(obj)) return key in obj
	return false
}

function unwrap(root: RootArg) {
	return (u.isFnc(root) ? root() : root) || {}
}

export function getValue<O extends any[]>(dataObject: O, paths: PathItem[]): any

export function getValue<O extends Record<string, any>>(
	dataObject: O,
	paths: PathItem[],
): any

export function getValue<O extends Record<string, any> | any[]>(
	dataObject: O,
	paths: PathItem[],
) {
	dataObject = unwrap(dataObject)
	paths = nu.toDataPath(nu.trimReference(paths.join('.') as any))

	let localKey =
		u.isStr(paths[0]) && nt.Identify.rootKey(paths[0]) ? paths[0] : undefined
	let datapath = paths.join('.')
	let currentKey: PathItem | undefined = paths.shift()
	let currentValue: any = dataObject[currentKey as string]
	let currentPath = [currentKey] as PathItem[]
	let lastValue
	let prevKey: PathItem | undefined

	while (paths.length) {
		lastValue = currentValue
		prevKey = currentKey
		currentKey = paths.shift() as PathItem
		currentPath.push(currentKey)
		currentValue = currentValue[currentKey]

		if (u.isStr(currentValue)) {
			if (nt.Identify.reference(currentValue)) {
				break
			}
		}

		if (!keyExists(paths[0], currentValue)) {
			break
		}
	}

	return {
		currentKey,
		currentValue,
		currentPath,
		dataObject,
		localKey,
		lastValue,
		path: datapath,
		unvisited: paths,
	}
}

const get = curry<Parameters<typeof unwrap>[0], string, string, any>(
	(
		root: Parameters<typeof unwrap>[0],
		path: PathItem | PathItem[],
		rootKey: PathItem = '',
	) => {
		const paths = [] as PathItem[]

		if (u.isStr(path)) {
			const datapath = nu.toDataPath(nu.trimReference(path as any))
			if (nt.Identify.rootKey(datapath[0])) {
				if (rootKey !== datapath[0]) rootKey = datapath[0]
				datapath.shift()
			}
			paths.push(...datapath)
		} else if (u.isNum(path)) {
			paths.push(path)
		} else if (u.isArr(path)) {
			paths.push(...path)
		}

		const key = paths.shift()
		const value = unwrap(root)[key]

		if (value !== undefined) {
			// if (u.isObj)
			if (u.isStr(value)) {
				if (nt.Identify.reference(value)) {
					//
				} else {
					if (nt.Identify.rootKey(value)) {
						return get(root, paths, rootKey)
					}
					return value
				}
			}
		}

		// Fall back with a normal retrieval as a last resort
		return unwrap(root)[String(rootKey)]
	},
	2,
)

export default get
