import * as u from '@jsmanifest/utils'
import yaml from 'yaml'
import { AppConfig } from 'noodl-types'

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
