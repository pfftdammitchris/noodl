import { Pair, Scalar, YAMLMap, YAMLSeq } from 'yaml/types'

export interface PlainObject {
	[key: string]: any
}

export type YAMLNode = Scalar | Pair | YAMLMap | YAMLSeq

export type QueryType = 'key-value' | 'strings'

export type QueryKeyValueArgs = [key: string, value: any, obj: PlainObject]

export type Report = { name: string; results: any[] }
