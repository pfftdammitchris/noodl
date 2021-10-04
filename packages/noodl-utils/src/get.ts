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
	path?: PathItem[]
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
	return u.isFnc(root) ? root() : root
}

unwrap.find = function (locations = [] as any[], path: PathItem) {
	return locations.find((obj) => keyExists(path, unwrap(obj)))
}

const get = curry(
	(
		options: (Options & { visited?: PathItem[] }) | undefined = undefined,
		pathProp?: PathItem | PathItem[],
	) => {
		let value: any

		if (pathProp) {
			if (u.isStr(pathProp)) {
				// Spawn a new instance
				if (nt.Identify.reference(pathProp)) {
					let dataPath = nu.toDataPath(nu.trimReference(pathProp))
					let rootKey = options.rootKey
					let startKey = dataPath[0]
					let path = [] as PathItem[]

					if (nt.Identify.rootKey(startKey)) {
						if (rootKey !== startKey) rootKey = dataPath.shift()
						else dataPath.shift()
						path[0] = rootKey
					} else {
						path[0] = startKey
					}

					if (!rootKey) {
						throw new Error('rootKey not found on a new instance')
					}

					const locations = options.locations ? u.array(options.locations) : []
					let local

					if (options.root) {
						local = unwrap(options.root)[rootKey]
						!locations.includes(options.root) && locations.unshift(options.root)
						if (local) {
							!locations.includes(local) && locations.push(local)
						}
					}

					console.log(`[1]`, {
						...options,
						locations,
						local,
						path,
						rootKey,
						unvisited: dataPath,
					})

					return get(
						{
							...options,
							local,
							locations,
							path,
							rootKey,
							unvisited: dataPath,
						},
						dataPath,
					)
				}
			} else if (u.isArr(pathProp)) {
				if (pathProp.length) {
					const find = (locs, key) => {
						let count = locs.length
						while (count > 0) {
							--count
							console.log(`[find]`, { obj: locs[count], key })
							if (keyExists(key, locs[count])) return locs[count][key]
						}
					}

					const { local, locations, path: currentPath, root } = options

					// Continue existing
					let nextKey = pathProp.shift()
					value = find(locations, nextKey)

					if (isDataObject(value)) {
						currentPath.push(nextKey)
						!locations.includes(value) && locations.push(value)

						console.log(`[2]`, {
							...options,
							unvisited: pathProp,
							nextKey,
							value,
						})

						if (pathProp.length) {
							return get(
								{
									...options,
									path: currentPath,
									locations,
									unvisited: pathProp,
								},
								pathProp,
							)
						}
					}

					if (nt.Identify.reference(value)) {
						if (nt.Identify.localReference(value)) {
							if (locations.length > 2) locations.length = 2
							let reference = value

							console.log(`[3]`, {
								local,
								locations,
								root: options.root,
								rootKey: options.rootKey,
								value,
							})

							value = get(
								{
									local,
									locations,
									root: options.root,
									rootKey: options.rootKey,
								},
								value,
							)

							if (value === undefined) {
								throw new Error(
									`value was undefined in mid reference "${reference}"`,
								)
							}
						}
					}

					console.log(`[4]`, {
						...options,
						currentPath,
						unvisited: pathProp,
						nextKey,
						value,
					})

					if (pathProp.length) {
						return get(options, pathProp)
					}
				}
			}
		}

		// console.log({ options, pathProp })

		// let { locations, local, root, rootKey, unvisited = [] } = options

		// let dataObjects = u.filter(Boolean, u.array(locations))

		// !dataObjects.length && dataObjects.push(root)
		// local && !dataObjects.includes(local) && dataObjects.push(local)

		// while (unvisited.length) {
		// 	const nextKey = unvisited.shift() as PathItem
		// 	const dataObject = unwrap.find(dataObjects, nextKey)

		// 	if (keyExists(nextKey, dataObject)) {
		// 		value = dataObject[nextKey]
		// 	} else if (u.isStr(nextKey) && nt.Identify.reference(nextKey)) {
		// 		if (nt.Identify.reference(value)) {
		// 			console.log({ reference: nextKey })
		// 		}
		// 	}

		// 	if (
		// 		unvisited.length &&
		// 		isDataObject(value) &&
		// 		!dataObjects.includes(value)
		// 	) {
		// 		dataObjects.push(value)
		// 	}

		// 	console.log({
		// 		nextKey,
		// 		dataObject,
		// 		dataObjects,
		// 		pathProp,
		// 		unvisited,
		// 		value,
		// 	})
		// }

		return value
	},
	2,
)

export default get
