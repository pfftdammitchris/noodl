import { ToStringOptions, stringify } from 'yaml'
import type { YAMLDocument } from '../internal/yaml'

/**
 * Returns the stringified output of the yaml document. If there are errors, it
 * returns a stringified yaml output of the errors instead
 * @param { YAMLDocument } doc
 */
function stringifyDoc(
	doc: YAMLDocument | undefined | null,
	opts?: ToStringOptions,
) {
	let result = ''

	if (doc) {
		if (doc.errors.length) {
			result = stringify(doc.errors)
		} else {
			result = doc.toString({ singleQuote: true, ...opts })
		}
	}

	return result
}

export default stringifyDoc
