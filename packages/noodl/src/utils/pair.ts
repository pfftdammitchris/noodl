import { Pair } from 'yaml/types'
import regex from '../internal/regex'
import * as u from './internal'

export function isApplyReference(node: Pair) {
	if (u.isScalar(node.key) && u.isStr(node.key.value)) {
		if (regex.reference.at.apply.test(node.key.value)) return true
	}
	return false
}
