import * as u from '@jsmanifest/utils'
import * as nt from 'noodl-types'
import * as nu from 'noodl-utils'
import curry from 'lodash.curry'

export type RootArg = Record<string, any> | (() => Record<string, any>)
export type PathItem = string | number

export interface Options {
	locations?: any
	local?: Record<string, any>
	root?: RootArg
	rootKey?: string
	unvisited?: PathItem[]
}

function isPathable(value: unknown): value is PathItem {
	return u.isStr(value) || u.isNum(value)
}

function isDataObject(value: unknown): value is Record<string, any> | any[] {
	return u.isArr(value) || u.isObj(value)
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

unwrap.find = function (locations = [] as any[], path: PathItem) {
	return locations.find((obj) => keyExists(path, unwrap(obj)))
}

const get = curry(
	(
		options: (Options & { visited?: PathItem[] }) | undefined = undefined,
		pathProp?: PathItem | PathItem[],
	) => {
		if (pathProp) {
			if (u.isStr(pathProp)) {
				let dataPath = nu.toDataPath(nu.trimReference(pathProp))
				let rootKey = options.rootKey

				if (nt.Identify.rootKey(dataPath[0])) {
					if (rootKey !== dataPath[0]) rootKey = dataPath.shift()
				}

				return get(
					{
						...options,
						local: unwrap(options.root)[rootKey],
						rootKey,
						unvisited: dataPath.slice(),
					},
					dataPath,
				)
			}
		}

		let { locations, local, root, rootKey, unvisited = [] } = options

		let dataObjects = u.filter(Boolean, u.array(locations))
		let value: any

		!dataObjects.length && dataObjects.push(root)
		local && !dataObjects.includes(local) && dataObjects.push(local)

		while (unvisited.length) {
			const nextKey = unvisited.shift() as PathItem
			const dataObject = unwrap.find(dataObjects, nextKey)

			if (keyExists(nextKey, dataObject)) {
				value = dataObject[nextKey]
			} else if (u.isStr(nextKey) && nt.Identify.reference(nextKey)) {
				if (nt.Identify.reference(value)) {
					console.log({ reference: nextKey })
				}
			}

			if (
				unvisited.length &&
				isDataObject(value) &&
				!dataObjects.includes(value)
			) {
				dataObjects.push(value)
			}

			console.log({
				nextKey,
				dataObject,
				dataObjects,
				pathProp,
				unvisited,
				value,
			})
		}

		return value
	},
	2,
)

export default get
