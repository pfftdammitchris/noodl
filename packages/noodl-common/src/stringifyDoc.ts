import { Document, parseDocument } from 'yaml'

/**
 * Returns the stringified output of the yaml document. If there are errors, it
 * returns a JSON stringified list of errors instead
 * @param { Document } doc
 */
function stringifyDoc(doc: Document | undefined | null) {
	let result = ''

	if (doc) {
		if (doc.errors.length) {
			result = JSON.stringify(doc.errors, null, 2)
		} else {
			result = doc.toString()
		}
	}

	return result
}

export default stringifyDoc
