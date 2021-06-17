import * as u from '@jsmanifest/utils'
import { sync as globbySync } from 'globby'
import path from 'path'
import getAbsFilePath from './getAbsFilePath'
import getFileMetadataObject from './getFileMetadataObject'
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

function loadFiles<LType extends t.LoadType, LFType extends t.LoadFilesAs>(
	dir: string,
	opts?: {
		as?: LFType
		onFile?(args: { file: Document; filename: string }): void
		type?: LType
	},
): LFType extends 'list'
	? t.MetadataFileObject[]
	: LFType extends 'map'
	? Map<string, t.MetadataFileObject>
	: LFType extends 'object'
	? Record<string, t.MetadataFileObject>
	: Record<string, t.MetadataFileObject>

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

function loadFiles<
	LType extends t.LoadType = t.LoadType,
	LFType extends t.LoadFilesAs = t.LoadFilesAs,
>(
	args: string,
	opts:
		| t.LoadType
		| {
				as?: LFType
				onFile?(args: { file: Document; filename: string }): void
				type?: LType
		  } = 'yml',
) {
	let ext = 'yml'

	if (u.isStr(args)) {
		opts === 'json' && (ext = 'json')
		const dir = args
		const glob = `**/*.${ext}`
		const _path = normalizePath(getAbsFilePath(path.join(dir, glob)))
		if (u.isStr(opts)) {
			return globbySync(_path, { onlyFiles: true }).map((filepath) =>
				loadFile(filepath, opts),
			)
		} else if (u.isObj(opts)) {
			opts.type === 'json' && (ext = 'json')
			function listReducer(acc: any[] = [], filepath: string) {
				return acc.concat(loadFile(filepath, ext))
			}
			function mapReducer(acc: Map<string, any>, filepath: string) {
				const filename = path.posix.basename(filepath)
				acc.set(filename, loadFile(filepath, ext))
				return acc
			}
			function objectReducer(acc: Record<string, any>, filepath: string) {
				const metadata = getFileMetadataObject(filepath)
				acc[metadata.filename] = loadFile(filepath, ext)
				return acc
			}
			const items = globbySync(_path, { onlyFiles: true })
			if (opts.as === 'list') return u.reduce(items, listReducer, [])
			if (opts.as === 'map') return u.reduce(items, mapReducer, new Map())
			return u.reduce(items, objectReducer, {})
		}
	} else if (u.isObj(args)) {
		// ext = args.ext || ext
		// const result = {}
		// const dir = getAbsFilePath(args.dir)
		// const glob = `**/*.${ext}`
		// const filepaths = globbySync(
		// 	path.normalize(path.join(getAbsFilePath(dir), glob)),
		// 	{ onlyFiles: true },
		// )
		// for (const filepath of filepaths) {
		// 	const metadata = getFileMetadataObject(filepath)
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
