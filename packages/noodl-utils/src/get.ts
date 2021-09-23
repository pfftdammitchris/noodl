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
	// let datapath = nu.trimReference(paths.join('.') as any)
	// let unvisited = nu.toDataPath(datapath) as PathItem[]
	// let currentKey = unvisited.shift() as PathItem
	// let currentValue =
	// 	isPathable(currentKey) && unvisited.length
	// 		? unwrap(dataObject)[currentKey]
	// 		: undefined
	// let currentPath = [currentKey] as PathItem[]
	// let localKey = paths.shift()
	// let lastValue: any = currentValue
	// let prevKey
	let localKey =
		u.isStr(paths[0]) && nt.Identify.rootKey(paths[0]) ? paths[0] : undefined
	let datapath = paths.join('.')
	let currentKey: PathItem | undefined = paths.shift()
	let currentValue: any = dataObject[currentKey as string]
	let currentPath = [currentKey] as PathItem[]
	let lastValue
	let prevKey: PathItem | undefined

	// currentPath.push(paths.shift() as PathItem)

	while (paths.length) {
		lastValue = currentValue
		prevKey = currentKey
		currentKey = paths.shift() as PathItem
		currentPath.push(currentKey)
		currentValue = currentValue[currentKey]

		// if (unvisited.length) {
		// 	if (u.isArr(currentValue) && !currentValue.includes(paths[0])) {
		// 		break
		// 	} else if (u.isObj(currentValue) && !(paths[0] in currentValue)) {
		// 		break
		// 	}
		// }

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
	(root: Parameters<typeof unwrap>[0], key = '', localKey: PathItem = '') => {
		if (u.isNum(key)) {
			//
		}

		if (u.isStr(key)) {
			let datapathStr = nt.Identify.reference(key) ? nu.trimReference(key) : key
			let datapath = nu.toDataPath(datapathStr) as PathItem[]
			let value: any = key

			if (!localKey && nt.Identify.rootKey(datapathStr)) {
				localKey = datapath[0]
			}

			console.log(`[${u.green('1')}]`, {
				datapath,
				datapathStr,
				localKey,
				value,
			})

			let result: ReturnType<typeof getValue>

			if (u.isStr(value)) {
				if (nt.Identify.reference(value)) {
					if (nt.Identify.localReference(value)) {
						result = getValue(root, [localKey, ...datapath])
					} else {
						result = getValue(root, datapath)
					}
					value = result.currentValue
				} else {
					result = getValue(
						root,
						nt.Identify.localKey(value) ? [localKey, ...datapath] : datapath,
					)
					value = result.currentValue
				}
			}

			console.log(`[${u.green('4')}]`, {
				datapath,
				datapathStr,
				value,
				key,
				localKey,
				result,
			})

			while (nt.Identify.reference(value)) {
				datapathStr = nu.trimReference(value).concat(datapathStr)
				datapath = nu
					.toDataPath(nu.trimReference(value))
					.concat(datapath as string[])

				console.log(`[while] value`, { datapath, datapathStr, value })

				if (value.startsWith('..') || nt.Identify.localKey(datapathStr)) {
					result = getValue(unwrap(root), [localKey, ...datapath])
					console.log(`[${u.green('5A')}]`, u.omit(result, ['dataObject']))
				} else {
					console.log(`[${u.green('5B')}]`, {
						datapath,
						datapathStr,
						localKey,
						key,
						value,
					})
					result = getValue(unwrap(root), datapath)
					console.log(`[${u.green('5C')}]`, u.omit(result, ['dataObject']))
				}

				value = result.currentValue

				if (!nt.Identify.reference(value)) {
					console.log(`[${u.green('7 - break')}]`, result)
					break
				}
			}

			console.log(`[${u.green('8 - final')}]`, {
				datapath,
				datapathStr,
				localKey,
				value,
			})

			return value
		}

		// Fall back with a normal retrieval as a last resort
		return unwrap(root)[String(key)]
	},
	2,
)

export default get
