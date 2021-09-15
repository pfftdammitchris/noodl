import * as u from '@jsmanifest/utils'
import fs from 'fs-extra'
import type { LiteralUnion } from 'type-fest'
import path from 'path'
import {
	Document,
	parse as parseYmlToJson,
	parseDocument as parseYmlToDoc,
} from 'yaml'
import getAbsFilePath from './getAbsFilePath.js'
import * as t from './types.js'

/**
 * Loads a file at filepath relative to the current file
 * @param { string } filepath - File path of file to be loaded
 */
function loadFile<T extends 'yml'>(
	filepath: string,
	type?: LiteralUnion<T, string>,
): string

function loadFile<T extends 'doc'>(
	filepath: string,
	type: LiteralUnion<T, string>,
): Document

function loadFile<T extends 'json'>(
	filepath: string,
	type: LiteralUnion<T, string>,
): Record<string, any>

function loadFile<T extends t.LoadType = t.LoadType>(
	filepath: string,
	type?: T,
) {
	if (u.isStr(filepath)) {
		if (!path.isAbsolute(filepath)) filepath = getAbsFilePath(filepath)
		if (fs.existsSync(filepath)) {
			const yml = fs.readFileSync(filepath, 'utf8')
			if (type === 'doc') return parseYmlToDoc(yml)
			if (type === 'json') return parseYmlToJson(yml)
			return fs.readFileSync(filepath, 'utf8')
		}
	}
}

export default loadFile
