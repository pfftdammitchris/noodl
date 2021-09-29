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
		const dataObjects = u.isArr(root) ? root : [root]
		const paths = [] as PathItem[]

		if (u.isStr(path)) {
			const datapath = nu.toDataPath(nu.trimReference(path as any))
			if (nt.Identify.rootKey(datapath[0])) {
				if (rootKey !== datapath[0]) rootKey = datapath[0]
				// datapath.shift()
			}
			paths.push(...datapath)
		} else if (u.isNum(path)) {
			paths.push(path)
		} else if (u.isArr(path)) {
			paths.push(...path)
		}

		const key = paths.shift()
		const value = unwrap(
			dataObjects.find((unwrappedObj) => {
				const dataObject = unwrap(unwrappedObj)
				return u.isObj(dataObject) ? key in dataObject : false
			}),
		)?.[key]

		console.log({ value })

		if (!u.isNil(value)) {
			if (u.isStr(value)) {
				if (nt.Identify.reference(value)) {
					if (nt.Identify.localReference(value)) {
						console.log({
							root: unwrap(root),
							key,
							value,
							unvisited: paths,
							paths,
							rootKey,
						})
						const result = get(dataObjects, [key, ...paths], rootKey)
						// console.log({ result })
						// return result
					}
				} else {
					if (nt.Identify.rootKey(value)) {
						return get(root, paths, rootKey)
					}
					return value
				}
			} else if (u.isArr(value)) {
				//
			} else if (u.isObj(value)) {
				if (u.isStr(key)) {
					console.log({ key, value, paths, rootKey })
					return get([root, value], paths, rootKey)
				}
			}
		}

		// Fall back with a normal retrieval as a last resort
		return unwrap(root)[rootKey]
	},
	2,
)

export default get
