import { Pair, isScalar } from 'yaml'
import regex from '../internal/regex'
import * as u from './internal'

export function isApplyReference(node: Pair) {
	if (isScalar(node.key) && u.isStr(node.key.value)) {
		if (regex.reference.at.apply.test(node.key.value)) return true
	}
	return false
}
