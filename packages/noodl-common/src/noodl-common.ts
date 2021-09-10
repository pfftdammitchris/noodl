import * as u from '@jsmanifest/utils'
import chalk from 'chalk'
import { sync as globbySync } from 'globby'
import { join as joinPaths, resolve as resolvePath } from 'path'
import * as fs from 'fs-extra'
import type { WriteFileOptions } from 'fs-extra'
import { Document, parseDocument as parseYmlToDoc } from 'yaml'
import minimatch from 'minimatch'
import normalizePath from './normalizePath.js'

// const {
// 	readdirSync: _readdirSync,
// 	readFileSync,
// 	statSync,
// 	writeFileSync: _writeFileSync,
// } = fs

export const captioning = (...s: any[]) => chalk.hex('#40E09F')(...s)
export const highlight = (...s: any[]) => chalk.yellow(...s)
export const italic = (...s: any[]) => chalk.italic(chalk.white(...s))
export const aquamarine = (...s: any[]) => chalk.keyword('aquamarine')(...s)
export const lightGold = (...s: any[]) => chalk.keyword('blanchedalmond')(...s)
export const blue = (...s: any[]) => chalk.keyword('deepskyblue')(...s)
export const fadedBlue = (...s: any[]) => chalk.blue(...s)
export const cyan = (...s: any[]) => chalk.cyan(...s)
export const brightGreen = (...s: any[]) => chalk.keyword('chartreuse')(...s)
export const lightGreen = (...s: any[]) => chalk.keyword('lightgreen')(...s)
export const green = (...s: any[]) => chalk.green(...s)
export const coolGold = (...s: any[]) => chalk.keyword('navajowhite')(...s)
export const gray = (...s: any[]) => chalk.keyword('lightslategray')(...s)
export const hotpink = (...s: any[]) => chalk.hex('#F65CA1')(...s)
export const fadedSalmon = (...s: any[]) => chalk.keyword('darksalmon')(...s)
export const magenta = (...s: any[]) => chalk.magenta(...s)
export const orange = (...s: any[]) => chalk.keyword('lightsalmon')(...s)
export const deepOrange = (...s: any[]) => chalk.hex('#FF8B3F')(...s)
export const lightRed = (...s: any[]) => chalk.keyword('lightpink')(...s)
export const coolRed = (...s: any[]) => chalk.keyword('lightcoral')(...s)
export const red = (...s: any[]) => chalk.keyword('tomato')(...s)
export const teal = (...s: any[]) => chalk.keyword('turquoise')(...s)
export const white = (...s: any[]) => chalk.whiteBright(...s)
export const yellow = (...s: any[]) => chalk.yellow(...s)
export const newline = () => console.log('')

export function ensureSlashPrefix(s: string) {
	if (!s.startsWith('/')) s = `/${s}`
	return s
}

export function ensureSuffix(value: string, s: string) {
	if (!value.endsWith(s)) value = `${value}${s}`
	return value
}

export function getExt(str: string) {
	return hasDot(str) ? str.substring(str.lastIndexOf('.') + 1) : ''
}

export function getPathname(str: string) {
	return hasSlash(str) ? str.substring(str.lastIndexOf('/') + 1) : ''
}

export function getFilename(str: string) {
	if (!hasSlash(str)) return str
	return str.substring(str.lastIndexOf('/') + 1)
}

export function hasDot(s: string) {
	return !!s?.includes('.')
}

export function hasSlash(s: string) {
	return !!s?.includes('/')
}

export function loadFileAsDoc(filepath: string) {
	return parseYmlToDoc(fs.readFileSync(filepath, 'utf8'))
}

export function loadFilesAsDocs(opts: {
	as: 'doc'
	dir: string
	includeExt?: boolean
	recursive: boolean
}): Document.Parsed[]

export function loadFilesAsDocs(opts: {
	as: 'metadataDocs'
	dir: string
	includeExt?: boolean
	recursive: boolean
}): { name: string; doc: Document.Parsed }[]

export function loadFilesAsDocs({
	as = 'doc',
	dir,
	includeExt = true,
	recursive = true,
}: {
	as?: 'doc' | 'metadataDocs'
	dir: string
	includeExt?: boolean
	recursive?: boolean
}) {
	const xform =
		as === 'metadataDocs'
			? (obj: any) => ({
					doc: loadFileAsDoc(normalizePath(obj.path)),
					name: includeExt
						? obj.name
						: obj.name.includes('.')
						? obj.name.substring(0, obj.name.lastIndexOf('.'))
						: obj.name,
			  })
			: (fpath: string) => loadFileAsDoc(fpath)
	return globbySync(normalizePath(dir, recursive ? '**/*.yml' : '*.yml'), {
		stats: as === 'metadataDocs',
		onlyFiles: true,
	}).map((fpath) => xform(fpath))
}

/**
 * Resolves an array of promises safely, inserting each result to the list
 * including errors that occurred inbetween.
 * @param { Promise[] } promises - Array of promises
 */
export async function promiseAllSafe(...promises: Promise<any>[]) {
	const results = [] as any[]
	for (const promise of promises) {
		try {
			const result = await promise
			results.push(result)
		} catch (error) {
			results.push(error)
		}
	}
	return results
}

export function readdirSync(
	dir: string | undefined = __dirname,
	opts?: { concat?: string[]; glob?: string },
) {
	const args = { encoding: 'utf8' as BufferEncoding }
	const files = [] as string[]
	const filepaths = fs.readdirSync(dir, args)
	const glob = opts?.glob || '**/*'
	for (let filepath of filepaths) {
		filepath = normalizePath(resolvePath(joinPaths(dir, filepath)))
		const stat = fs.statSync(filepath)
		if (stat.isFile()) {
			if (minimatch(filepath, glob)) files.push(filepath)
		} else if (stat.isDirectory()) {
			files.push(...readdirSync(filepath, opts))
		}
	}
	return files
}

export function sortObjPropsByKeys<O extends Record<string, any>>(obj: {
	[key: string]: any
}) {
	return u
		.entries(obj)
		.sort((a, b) => {
			if (a[1] > b[1]) return -1
			if (a[1] === b[1]) return 0
			return 1
		})
		.reduce(
			(acc: O, [key, value]) => Object.assign(acc, { [key]: value }),
			{} as O,
		)
}

export function writeFileSync(
	filepath = '',
	data: string,
	options?: WriteFileOptions,
) {
	fs.writeFileSync(
		normalizePath(filepath),
		data,
		u.isStr(options)
			? { encoding: options as BufferEncoding }
			: { encoding: 'utf8', ...(options as any) },
	)
}

export function withSuffix(suffix: string) {
	return function (str: string) {
		return str.endsWith(suffix) ? str : `${str}${suffix}`
	}
}

export const withYmlExt = withSuffix('.yml')
export const withEngLocale = withSuffix('_en')

export function withoutExt(str: string) {
	return hasDot(str) ? str.substring(str.lastIndexOf('.')) : str
}

// prettier-ignore
export const withTag = (colorFunc = cyan) => (s: string) => `[${colorFunc(s)}]`
