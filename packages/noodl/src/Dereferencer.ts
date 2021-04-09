import { Scalar, YAMLMap } from 'yaml'
import { YAMLNode } from './types'
import NoodlUtils from './Utils'
import {
	getScalarValue,
	isReference,
	isRootReference,
	isLocalReference,
} from './utils/scalar'
import NoodlPage from './Page'
import * as T from './types'
import * as u from './utils/internal'

class Dereferencer {
	#pages: T.InternalComposerBaseArgs['pages']
	#root: T.InternalComposerBaseArgs['root']
	#util: NoodlUtils

	constructor({
		pages,
		root,
		util = new NoodlUtils({ pages, root }),
	}: {
		pages: T.InternalComposerBaseArgs['pages']
		root: T.InternalComposerBaseArgs['root']
		util?: NoodlUtils
	}) {
		this.#pages = pages
		this.#root = root
		this.#util = util
	}

	// * Deeply finds the value to the reference and returns it (Does not mutate)
	// TODO - Support apply references
	getReference(ref: string, rootNode?: YAMLNode | NoodlPage): any {
		let value: any
		if (u.isStr(ref)) {
			if (ref.startsWith('.') || ref.startsWith('=')) {
				if (ref.startsWith('..')) {
					ref = ref.substring(2)
				} else if (ref.startsWith('.')) {
					ref = ref.substring(1)
				} else if (ref.startsWith('=')) {
					ref = ref.substring(1)
				}
				return this.getReference(ref)
			} else {
				if (ref[0] === ref[0].toUpperCase()) {
					value = this.getRootReference(ref)
				} else if (ref[0] === ref[0].toLowerCase()) {
					value = this.getLocalReference(ref, { page: rootNode })
				}
			}
		}
		return value
	}

	getLocalReference(
		node: string | Scalar,
		{
			keepScalar = false,
			page,
		}: { keepScalar?: boolean; page: YAMLMap | NoodlPage },
	) {
		if (!page) {
			throw new Error(
				`A root node was not provided for local reference: ${node}`,
			)
		}
		let value = page.getIn(
			u.trimInitialDots(getScalarValue(node)).split('.'),
			keepScalar,
		)
		if (u.isStr(value) && isReference(value)) {
			value = this.getReference(value, page)
		}
		return value
	}

	getRootReference(
		node: Scalar | string,
		{ keepScalar = false }: { keepScalar?: boolean } = {},
	): any {
		let path = u.trimInitialDots(getScalarValue(node)) as string
		let [key, ...paths] = path.split('.').filter(Boolean)
		let value

		if (this.#pages.has(key)) {
			if (!paths.length) {
				value = this.#pages.get(key)?.doc.contents
			} else if (paths.length === 1) {
				value = this.#pages.get(key)?.get?.(paths[0], true)
			} else if (paths.length > 1) {
				value = this.#pages.get(key)?.getIn?.(paths, true)
			}
		} else {
			if (this.#root.has(key)) {
				const n = key === 'Global' ? this.#root.Global : this.#root.get(key)
				if (paths.length) {
					value = this.#util.canUseGetIn(n) ? n.getIn(paths, keepScalar) : n
				} else {
					value = n
				}
			} else {
				return undefined
			}
		}

		if (u.isScalar(value) && isReference(value)) {
			if (isLocalReference(value)) {
				for (const page of this.#pages.values()) {
					if (page.contains(value)) {
						const [k, ...p] = value.value.split('.') as string[]
						if (p.length) {
							if (p.length === 1) {
								value = page.get(p)
							} else if (p.length > 1) {
								value = page.getIn(p)
							}
						} else {
							value = page.get(k)
						}
					}
				}
			} else if (isRootReference(value)) {
				value = this.getRootReference(value.value)
			}
		}

		return value
	}
}

export default Dereferencer
