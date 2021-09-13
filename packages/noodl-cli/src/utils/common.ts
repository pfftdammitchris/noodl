import * as u from '@jsmanifest/utils'
import * as nc from 'noodl-common'
import fs from 'fs-extra'
import path from 'path'
import type { WriteFileOptions } from 'fs-extra'
import yaml from 'yaml'

export function ensureSlashPrefix(s: string) {
	if (!s.startsWith('/')) s = `/${s}`
	return s
}

export function getCliConfig() {
	return yaml.parse(fs.readFileSync(nc.getAbsFilePath('noodl.yml'), 'utf8'))
}

/**
 * Normalizes the path (compatible with win). Useful for globs to work
 * expectedly
 * @param s
 * @returns { string }
 */
export function normalizePath(...s: string[]) {
	let result = (s.length > 1 ? path.join(...s) : s[0]).replace(/\\/g, '/')
	if (result.includes('/~/')) result = result.replace('~/', '')
	return result
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
