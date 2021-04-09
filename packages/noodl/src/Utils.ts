import { Node, Scalar, YAMLMap, YAMLSeq } from 'yaml'
import omit from 'lodash/omit'
import NoodlRoot from './Root'
import NoodlPage from './Page'
import * as commonUtils from './utils/index'
import * as u from './utils/internal'
import * as T from './types'

class NoodlUtils implements T.InternalComposerBaseArgs {
	#pages: T.InternalComposerBaseArgs['pages']
	#root: T.InternalComposerBaseArgs['root']
	#common = omit(commonUtils, 'Identify')

	constructor({ pages, root }: T.InternalComposerBaseArgs) {
		this.#pages = pages
		this.#root = root
	}

	get pages() {
		return this.#pages
	}

	get root() {
		return this.#root
	}

	get common() {
		return this.#common
	}

	get Identify() {
		return commonUtils.Identify
	}

	canUseGetIn(node: any): node is YAMLMap | YAMLSeq | NoodlPage | NoodlRoot {
		return u.isObj(node) && u.isFnc(node.getIn)
	}

	findPage(node: Node): null | NoodlPage {
		for (const page of this.pages.values()) {
			if (page.contains(node)) return page
		}
		return null
	}

	getValueFromRoot(node: string | Scalar) {
		let value = String(this.common.getScalarValue(node)) as any
		let [firstKey, ...paths] = value.split('.').filter(Boolean)
		if (this.pages.has(firstKey)) {
			if (!paths.length) {
				value = this.pages.get(firstKey)?.doc.contents
			} else if (paths.length === 1) {
				value = this.pages.get(firstKey)?.get?.(paths[0])
			} else if (paths.length > 1) {
				value = this.pages.get(firstKey)?.getIn?.(paths)
			}
		} else {
			if (this.root.has(firstKey)) {
				const n =
					firstKey === 'Global' ? this.root.Global : this.root.get(firstKey)
				if (paths.length) {
					value = this.canUseGetIn(n) ? n.getIn(paths) : n
				} else {
					value = n
				}
			} else {
				console.log(value)
				console.log(firstKey)
				console.log(firstKey)
				console.log(firstKey)
				return undefined
			}
		}
		return value
	}

	isRootReference(node: string | Scalar) {
		let value = String(this.common.getScalarValue(node))
		if (commonUtils.isRootReference(value)) return true
		value = u.trimInitialDots(value)
		if (value[0] === value[0].toUpperCase()) return true
		return this.root.has(value.split('.').filter(Boolean)[0] || '')
	}
}

export default NoodlUtils
