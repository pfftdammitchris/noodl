import ConfigStore from 'configstore'
import { LiteralUnion } from 'type-fest'

export interface Store<
	O extends Record<string, any>,
	K extends keyof O = keyof O,
> extends Omit<ConfigStore, 'get' | 'has' | 'set'> {
	all(): Record<LiteralUnion<K, string>, any>
	delete<Key extends string = string>(key: LiteralUnion<K, Key>): void
	get<Key extends string = string>(
		key: LiteralUnion<K, Key>,
	): Key extends K ? O[K] : any
	has<Key extends string = string>(key: LiteralUnion<K, Key>): void
	set<Key extends string = string>(
		key: LiteralUnion<K, Key>,
		value: Key extends K ? O[K] : any,
	): any
}

const store = new ConfigStore('noodl-cli', undefined, {
	globalConfigPath: true,
})

export default store
