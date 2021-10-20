// @ts-nocheck
import * as u from '@jsmanifest/utils'
import { globbySync } from 'globby'
import { Document as YAMLDocument, isDocument, isMap, Scalar } from 'yaml'
import path from 'path'
import getAbsFilePath from './getAbsFilePath.js'
import getBasename from './getBasename.js'
import getFileStructure from './getFileStructure.js'
import loadFile from './loadFile.js'
import normalizePath from './normalizePath.js'
import * as t from './types.js'

/**
 * Load files from dir and optionally provide a second argument as an options
 * object
 *
 * Supported options:
 *
 * - as: "list" to receive the result as an array, "map" as a Map, and "object"
 * 		as an object. Defaults to "list"
 * - onFile: A callback function to call when a filepath is being inserted to
 * 		the result
 * - type: Return each data in the from of "doc", "json", or "yml" (Defaults to
 * 		"yml")
 */

/**
 * Load files into an array of strings as raw yml
 */
function loadFiles<T extends 'yml', A extends 'list'>(
	dir: string,
	opts?: t.LoadFilesOptions<T, A>,
): string[]

/**
 * Load files into an array of objects
 */
function loadFiles<T extends 'json', A extends 'list'>(
	dir: string,
	opts?: t.LoadFilesOptions<T, A>,
): Record<string, any>[]

/**
 * Load files into an array of yaml documents
 */
function loadFiles<T extends 'doc', A extends 'list'>(
	dir: string,
	opts?: t.LoadFilesOptions<T, A>,
): YAMLDocument[]

/**
 * Load files into an object literal where key is the name and the value is
 * their yml
 */
function loadFiles<T extends 'yml', A extends 'object'>(
	dir: string,
	opts?: t.LoadFilesOptions<T, A>,
): Record<string, string>

/**
 * Load files into an object literal where key is the name and the value is a
 * JS object
 */
function loadFiles<T extends 'json', A extends 'object'>(
	dir: string,
	opts?: t.LoadFilesOptions<T, A>,
): Record<string, any>

/**
 * Load files into an object literal where key is the name and the value is a
 * yaml node
 */
function loadFiles<T extends 'doc', A extends 'object'>(
	dir: string,
	opts?: t.LoadFilesOptions<T, A>,
): Record<string, YAMLDocument>

/**
 * Load files into a Map where key is the name and value is their yml
 */
function loadFiles<T extends 'yml', A extends 'map'>(
	dir: string,
	opts?: t.LoadFilesOptions<T, A>,
): Map<string, string>

/**
 * Load files into a Map where key is the name and value is a JS object
 */
function loadFiles<T extends 'json', A extends 'map'>(
	dir: string,
	opts?: t.LoadFilesOptions<T, A>,
): Map<string, any>

/**
 * Load files into a Map where key is the name and value is a yaml node
 */
function loadFiles<T extends 'doc', A extends 'map'>(
	dir: string,
	opts?: t.LoadFilesOptions<T, A>,
): Map<string, YAMLDocument>

/**
 * Load files from dir and optionally a second argument as 'yml' (default) for an array of yml data
 */
function loadFiles<T extends 'yml'>(dir: string, type?: undefined | T): string[]

/**
 * Load files from dir and optionally a second argument as 'json' to receive
 * an array of objects
 */
function loadFiles<T extends 'json'>(
	dir: string,
	type: T,
): Record<string, any>[]

/**
 * Load files from dir and optionally a second argument as 'doc' to receive
 * an array of yaml nodes
 */
function loadFiles<T extends 'doc'>(dir: string, type: T): YAMLDocument[]

/**
 *
 * @param { string } args
 */
function loadFiles<
	LType extends t.LoadType = t.LoadType,
	LFType extends t.LoadFilesAs = t.LoadFilesAs,
>(dir: string, opts: t.LoadType | t.LoadFilesOptions<LType, LFType> = 'yml') {
	let ext = 'yml'
	let type = 'yml'

	if (u.isStr(dir)) {
		opts === 'json' && (ext = 'json')

		const glob = `**/*.${ext}`
		const _path = normalizePath(getAbsFilePath(path.join(dir, glob)))

		if (u.isStr(opts)) {
			type = opts === 'json' ? 'json' : opts === 'doc' ? 'doc' : type
			return globbySync(_path, { onlyFiles: true }).map((filepath) =>
				loadFile(filepath, type),
			)
		} else if (u.isObj(opts)) {
			type = opts.type || type
			const includeExt = opts?.includeExt
			const keysToSpread = opts.spread ? u.array(opts.spread) : []

			function getKey(metadata: t.FileStructure) {
				return includeExt ? getBasename(metadata.filepath) : metadata.filename
			}

			function listReducer(acc: any[] = [], filepath: string) {
				return acc.concat(loadFile(filepath, type))
			}

			function mapReducer(acc: Map<string, any>, filepath: string) {
				const metadata = getFileStructure(filepath)
				const key = getKey(metadata)
				const data = loadFile(filepath, type)
				isDocument(data) && data.has(key) && (data.contents = data.get(key))
				if (keysToSpread.includes(key)) {
					if (isDocument(data) && isMap(data.contents)) {
						for (const item of data.contents.items) {
							const itemKey = item.key as Scalar<string>
							acc.set(itemKey.value, item.value)
						}
					} else if (u.isObj(data)) {
						for (const [key, value] of u.entries(data)) acc.set(key, value)
					}
				} else {
					acc.set(key, data)
				}
				return acc
			}

			function objectReducer(acc: Record<string, any>, filepath: string) {
				const metadata = getFileStructure(filepath)
				const key = getKey(metadata)
				let data = loadFile(filepath, type)
				u.isObj(data) && key in data && (data = data[key])
				if (keysToSpread.includes(key) && u.isObj(data)) {
					if (isDocument(data) && isMap(data.contents)) {
						data.contents.items.forEach((pair) => {
							acc[String(pair.key)] = pair.value
						})
					} else if (u.isObj(data)) {
						u.assign(acc, data)
					}
				} else {
					acc[key] = data
				}
				return acc
			}

			const items = globbySync(_path, { onlyFiles: true })
			if (opts.as === 'list') return u.reduce(items, listReducer, [])
			if (opts.as === 'map') return u.reduce(items, mapReducer, new Map())
			return u.reduce(items, objectReducer, {})
		}
	} else if (u.isObj(dir)) {
		//
	}
}

export default loadFiles
