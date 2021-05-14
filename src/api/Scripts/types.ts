import yaml from 'yaml'
import { YAMLNode } from '../../types'

export namespace Script {
	export interface Register<Store extends Record<string, any>> {
		(store: Store): Config<Store>
	}

	export interface ComposableTransduce {
		(args: Parameters<ConsumerFunc>[0]): (
			step: <V>(val: V) => V,
		) => ConsumerFunc
	}

	export interface ConsumerFunc {
		(visitorArgs: {
			doc: yaml.Document.Parsed<any>
			key: Parameters<yaml.visitorFn<any>>[0]
			node: YAMLNode
			path: Parameters<yaml.visitorFn<any>>[2]
		}): ReturnType<yaml.visitorFn<any>>
	}

	export interface Config<Store extends Record<string, any>> {
		key: keyof Store
		label?: string
		cond?: 'scalar' | 'pair' | 'map' | 'seq' | ((node: yaml.Node) => boolean)
		fn: ConsumerFunc
	}

	export interface Hooks<Store extends Record<string, any>> {
		onStart(store: Store): void
		onEnd(store: Store): void
	}

	export type HooksRegister<
		Store extends Record<string, any> = Record<string, any>,
		HookKey extends keyof Hooks<Store> = keyof Hooks<Store>,
	> = Hooks<Store>[HookKey] | Hooks<Store>[HookKey][]

	export interface Metadata {
		page?: string
	}
}
