import { Pair, Scalar, YAMLMap, YAMLSeq } from 'yaml'

export interface PlainObject {
	[key: string]: any
}

export type YAMLNode = Scalar | Pair | YAMLMap | YAMLSeq

export type QueryType = 'key-value' | 'strings'

export type QueryKeyValueArgs = [key: string, value: any, obj: PlainObject]

export type Report = { name: string; results: any[] }

export interface ItemMetadata<V = any> {
	page?: string
	node: YAMLNode
	value?: V
}

export interface ReferenceItemMetadata<R extends string>
	extends ItemMetadata<R> {}
