import * as u from '@jsmanifest/utils'
import { isNode, isScalar, isPair, Node } from 'yaml'

function toString(v: Node | string | null | undefined): string {
	if (v === null || v === undefined) return ''
	if (u.isStr(v)) return v
	if (!isNode(v)) return JSON.stringify(v)
	if (isScalar(v)) return v.toString()
	if (isPair(v)) return isScalar(v.key) ? toString(v.key) : String(v.key)
	return JSON.stringify(v.toJSON(), null, 2)
}

export default toString
