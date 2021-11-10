import yaml from 'yaml'
import * as nt from 'noodl-types'

export function extractPreloadPages(
	doc: yaml.Document | nt.AppConfig | undefined,
) {
	if (yaml.isDocument(doc)) {
		return ((doc.get('preload') as yaml.YAMLSeq)?.toJSON?.() || []) as string[]
	} else {
		return doc?.preload || []
	}
}

export default function extractPages(
	doc: yaml.Document | nt.AppConfig | undefined,
	opts?: { preload?: boolean },
) {
	if (opts?.preload) return extractPreloadPages(doc)
	if (yaml.isDocument(doc)) {
		return ((doc.get('page') as yaml.YAMLSeq)?.toJSON?.() || []) as string[]
	} else {
		return doc?.page || []
	}
}
