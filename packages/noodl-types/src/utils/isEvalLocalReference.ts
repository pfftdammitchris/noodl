import { ReferenceString } from '../ecosTypes.js'

/**
 * true: "=.."
 *
 * false: "=."
 */

export default function isEvalLocalReference(
	v = '',
): v is ReferenceString<string, '=..'> {
	if (v.startsWith('=..')) return true
	return false
}
