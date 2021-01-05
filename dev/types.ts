export interface PlainObject {
	[key: string]: any
}

export type QueryType = 'key-value' | 'strings'

export type QueryKeyValueArgs = [key: string, value: any, obj: PlainObject]

export type Report = { name: string; results: any[] }
