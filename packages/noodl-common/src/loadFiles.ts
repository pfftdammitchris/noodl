import * as u from '@jsmanifest/utils'
import { sync as globbySync } from 'globby'
import { isDocument } from 'yaml'
import path from 'path'
import getAbsFilePath from './getAbsFilePath'
import getBasename from './getBasename'
import getFileStructure from './getFileStructure'
import loadFile from './loadFile'
import normalizePath from './normalizePath'
import * as t from './types'

/**
 * Load files from dir and optionally provide a second argument as an options object
 *
 * Supported options:
 * - as: "list" to receive the result as an array, "map" as a Map, and "object" as an object. Defaults to "list"
 * - onFile: A callback function to call when a filepath is being inserted to the result
 * - type: Return each data in the from of "doc", "json", or "yml" (Defaults to "yml")
 */

function loadFiles(
	dir: string,
	opts?: t.LoadFilesOptions<'yml', undefined | 'list'>,
): t.FileStructure[]

function loadFiles(
	dir: string,
	opts?: t.LoadFilesOptions<'json', undefined | 'list'>,
): Record<string, t.FileStructure>

function loadFiles(
	dir: string,
	opts?: t.LoadFilesOptions<'doc', undefined | 'list'>,
): Map<string, t.FileStructure>

function loadFiles<LType extends t.LoadType, LFType extends t.LoadFilesAs>(
	dir: string,
	opts?: t.LoadFilesOptions<LType, LFType>,
): LFType extends 'list'
	? t.FileStructure[]
	: LFType extends 'map'
	? Map<string, t.FileStructure>
	: LFType extends 'object'
	? Record<string, t.FileStructure>
	: Record<string, t.FileStructure>

/**
 * Load files from dir and optionally a second argument as one of: "doc", "json", or "yml"
 */
function loadFiles<LType extends t.LoadType = 'yml'>(
	dir: string,
	type?: LType,
): LType extends 'doc'
	? Document[]
	: LType extends 'json'
	? Record<string, any>[]
	: string[]

/**
 *
 * @param { string } args
 */
function loadFiles<
	LType extends t.LoadType = t.LoadType,
	LFType extends t.LoadFilesAs = t.LoadFilesAs,
>(dir: string, opts: t.LoadType | t.LoadFilesOptions<LType, LFType> = 'yml') {
	let ext = 'yml'

	if (u.isStr(dir)) {
		opts === 'json' && (ext = 'json')
		const glob = `**/*.${ext}`
		const _path = normalizePath(getAbsFilePath(path.join(dir, glob)))

		if (u.isStr(opts)) {
			return globbySync(_path, { onlyFiles: true }).map((filepath) =>
				loadFile(filepath, opts),
			)
		} else if (u.isObj(opts)) {
			const includeExt = opts?.includeExt
			opts.type === 'json' && (ext = 'json')

			function getKey(metadata: t.FileStructure) {
				return includeExt ? getBasename(metadata.filepath) : metadata.filename
			}

			function listReducer(acc: any[] = [], filepath: string) {
				return acc.concat(loadFile(filepath, ext))
			}

			function mapReducer(acc: Map<string, any>, filepath: string) {
				const metadata = getFileStructure(filepath)
				const key = getKey(metadata)
				let data = loadFile(filepath, ext)
				isDocument(data) && data.has(data) && (data.contents = data.get(key))
				acc.set(key, data)
				return acc
			}

			function objectReducer(acc: Record<string, any>, filepath: string) {
				const metadata = getFileStructure(filepath)
				const key = getKey(metadata)
				let data = loadFile(filepath, ext)
				u.isObj(data) && key in data && (data = data[key])
				acc[key] = data
				return acc
			}

			const items = globbySync(_path, { onlyFiles: true })
			if (opts.as === 'list') return u.reduce(items, listReducer, [])
			if (opts.as === 'map') return u.reduce(items, mapReducer, new Map())
			return u.reduce(items, objectReducer, {})
		}
	} else if (u.isObj(dir)) {
		// ext = args.ext || ext
		// const result = {}
		// const dir = getAbsFilePath(args.dir)
		// const glob = `**/*.${ext}`
		// const filepaths = globbySync(
		// 	path.normalize(path.join(getAbsFilePath(dir), glob)),
		// 	{ onlyFiles: true },
		// )
		// for (const filepath of filepaths) {
		// 	const metadata = getFileStructure(filepath)
		// 	const filedata =
		// 		ext === 'json'
		// 			? JSON.parse(readFileSync(filepath, 'utf8'))
		// 			: args.raw
		// 			? readFileSync(filepath, 'utf8')
		// 			: parseYmlToDoc(readFileSync(filepath, 'utf8'))
		// 	result[filepath] = filedata
		// }
	}
}

export default loadFiles
