import { AxiosError } from 'axios'
import fs from 'fs-extra'
import isPlainObject from 'lodash/isPlainObject'
import path from 'path'
import chalk from 'chalk'
import yaml from 'yaml'
import globby from 'globby'

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
export const purple = (...s: any[]) => chalk.keyword('purple')(...s)
export const lightRed = (...s: any[]) => chalk.keyword('lightpink')(...s)
export const coolRed = (...s: any[]) => chalk.keyword('lightcoral')(...s)
export const red = (...s: any[]) => chalk.keyword('tomato')(...s)
export const teal = (...s: any[]) => chalk.keyword('turquoise')(...s)
export const white = (...s: any[]) => chalk.whiteBright(...s)
export const yellow = (...s: any[]) => chalk.yellow(...s)
export const newline = () => console.log('')

export function createPlaceholderReplacer(
	placeholders: string | string[],
	flags?: string,
) {
	const regexp = new RegExp(
		(Array.isArray(placeholders) ? placeholders : [placeholders]).reduce(
			(str, placeholder) => str + (!str ? placeholder : `|${placeholder}`),
			'',
		),
		flags,
	)
	function replace(str: string, value: string | number): string
	function replace<Obj extends {} = any>(obj: Obj, value: string | number): Obj
	function replace<Obj extends {} = any>(
		str: string | Obj,
		value: string | number,
	) {
		if (typeof str === 'string') {
			return str.replace(regexp, String(value))
		} else if (isPlainObject(str)) {
			const stringified = JSON.stringify(str).replace(regexp, String(value))
			return JSON.parse(stringified)
		}
		return ''
	}
	return replace
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

export function getAbsFilePath(...paths: string[]) {
	return path.normalize(path.resolve(path.join(process.cwd(), ...paths)))
}

export function hasDot(s: string) {
	return !!s?.includes('.')
}

export function hasSlash(s: string) {
	return !!s?.includes('/')
}

export function hasCliConfig() {
	return fs.existsSync(getAbsFilePath('noodl.yml'))
}

export function loadFileAsDoc(filepath: string) {
	return yaml.parseDocument(fs.readFileSync(filepath, 'utf8'))
}

export function loadFilesAsDocs(opts: {
	as: 'doc'
	dir: string
	recursive: boolean
}): yaml.Document.Parsed[]
export function loadFilesAsDocs(opts: {
	as: 'metadataDocs'
	dir: string
	recursive: boolean
}): { name: string; doc: yaml.Document.Parsed }[]
export function loadFilesAsDocs({
	as = 'doc',
	dir,
	recursive = true,
}: {
	as?: 'doc' | 'metadataDocs'
	dir: string
	recursive?: boolean
}) {
	const xform =
		as === 'metadataDocs'
			? (obj: any) => ({ doc: loadFileAsDoc(obj.path), name: obj.name })
			: (fpath: string) => loadFileAsDoc(fpath)
	return globby
		.sync(path.join(dir, recursive ? '**/*.yml' : '*.yml'), {
			objectMode: as === 'metadataDocs',
			onlyFiles: true,
		})
		.map((fpath) => xform(fpath))
}

export function loadFiles(opts: {
	dir: string
	ext: 'yml'
	onFile?(args: { file: yaml.Document; filename: string }): void
}): yaml.Document[]
export function loadFiles(opts: {
	dir: string
	ext: 'json'
	onFile?(args: { file: Record<string, any>; filename: string }): void
}): Record<string, any>[]
export function loadFiles({
	dir,
	ext = 'json',
	onFile,
}: {
	dir: string
	ext?: 'json' | 'yml'
	onFile?(args: {
		file?: Record<string, any> | yaml.Document
		filename: string
	}): void
}) {
	return globby
		.sync(path.resolve(getAbsFilePath(dir), `**/*.${ext}`))
		.reduce((acc, filename) => {
			const file =
				ext === 'json'
					? fs.readJsonSync(filename)
					: yaml.parseDocument(fs.readFileSync(filename, 'utf8'))
			onFile?.({ file, filename })
			return acc.concat(file)
		}, [])
}

export function isImg(s: string) {
	return /([a-z\-_0-9\/\:\.]*\.(jpg|jpeg|png|gif|bmp|tif))/i.test(s)
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

export function prettifyErr(err: AxiosError | Error) {
	if ('response' in err) {
		if (err?.response?.data) {
			return `[${chalk.yellow('AxiosError')}}]: ${err.response.data}`
		}
	}
	return `[${chalk.yellow(err.name)}]: ${chalk.red(err.message)}`
}

export const replaceBaseUrlPlaceholder = createPlaceholderReplacer(
	'\\${cadlBaseUrl}',
	'g',
)

export const replaceDesignSuffixPlaceholder = createPlaceholderReplacer(
	'\\${designSuffix}',
	'g',
)

export const replaceTildePlaceholder = createPlaceholderReplacer('~/')

export const replaceVersionPlaceholder = createPlaceholderReplacer(
	'\\${cadlVersion}',
	'g',
)
