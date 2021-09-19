import * as u from '@jsmanifest/utils'
import * as nt from 'noodl-types'
import { LiteralUnion } from 'type-fest'

export type BaseRootKey = 'Config' | 'Global' | 'Style'
export type RootObject<K extends string = string> = Record<
	LiteralUnion<K | BaseRootKey, string>,
	any
>
export type RootKey = keyof RootObject<BaseRootKey>
export type RootMap = Map<RootKey, RootObject[RootKey]>

class Root<K extends RootKey = RootKey> {
	#root: RootMap = new Map();

	[Symbol.for('nodejs.util.inspect.custom')]() {
		return u.reduce(
			[...this.#root.values()],
			(acc, [key, value]) => u.assign(acc, { [key]: value }),
			{},
		)
	}

	[Symbol.iterator]() {
		const items = [...this.#root.entries()].reverse()
		return {
			next() {
				return {
					value: items.pop(),
					done: !items.length,
				}
			},
		}
	}

	get Config() {
		return this.#root.get('Config') as nt.RootConfig
	}

	get Global() {
		return this.#root.get('Global')
	}

	get Style() {
		return this.#root.get('Style') as nt.StyleObject
	}

	get(key: LiteralUnion<K, string>): RootObject[K]
	get(): RootMap
	get(key?: LiteralUnion<K, string>) {
		if (key) return this.#root.get(key)
		return this.#root
	}

	has(key: string) {
		return this.#root.has(key)
	}

	set(key: LiteralUnion<K, string>, value: any) {
		this.#root.set(key, value)
	}

	remove(key: LiteralUnion<K, string>) {
		this.#root.delete(key)
	}

	load<O extends RootObject<K>>(
		obj: O,
		{ spread }: { spread?: string | string[] },
	) {
		const spreadKeys = spread ? u.array(spread) : []

		if (u.isObj(obj)) {
			for (const [key, value] of u.entries(obj)) {
				if (spreadKeys.includes(key)) {
					this.spread(key, value)
				} else {
					this.set(key, value)
				}
			}
		}
	}

	spread(key: LiteralUnion<K, string>, value = this.get(key)) {
		if (u.isObj(value)) {
			for (const [k, v] of u.entries(value)) this.set(k, v)
		}
		if (this.has(key)) this.#root.delete(key)
	}
}

export default Root
