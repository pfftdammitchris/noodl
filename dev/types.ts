export type OccurredLocation =
	| 'init'
	| 'components'
	| 'save'
	| 'check'
	| 'update'
	| 'other'

export type LocationObject = {
	pages: string[]
}

export interface DataObject {
	pages: string[]
	occurred: number
	locations: Partial<Record<OccurredLocation, LocationObject>>
	values: DataValueObject[]
}

export type DataValueObject<V = any> = Record<
	string,
	{
		type: 'await' | 'evolve' | 'merge' | 'traverse' | 'tilde'
		location: OccurredLocation
		page: string
		value: V
		actionChain: boolean
	}
>
