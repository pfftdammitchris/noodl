import yaml from 'yaml'
import type { AppConfig } from 'noodl-types'

export function extractPreloadPages(
	doc: yaml.Document | AppConfig | undefined,
) {
	if (yaml.isDocument(doc)) {
		return ((doc.get('preload') as yaml.YAMLSeq)?.toJSON?.() || []) as string[]
	} else {
		return doc?.preload || []
	}
}

export function extractPages(doc: yaml.Document | AppConfig | undefined) {
	if (yaml.isDocument(doc)) {
		return ((doc.get('page') as yaml.YAMLSeq)?.toJSON?.() || []) as string[]
	} else {
		return doc?.page || []
	}
}

export function shallowMerge<O = any>(obj: O, value: any) {
	if (value !== null && typeof value === 'object') {
		for (const [key, val] of Object.entries(value)) obj[key] = val
	}
	return obj
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
