import * as nt from 'noodl-types'
import { OrArray } from '@jsmanifest/typefest'

export interface DataItemDescriptor<
	O extends Record<string, any> = Record<string, any>,
> {
	[app: string]: {
		pages: {
			name: string
		} & O
	}
}

export interface Data {
	actions: {
		actionTypes: string[]
		properties: {
			[key: string]: DataItemDescriptor<{
				components?: OrArray<nt.ComponentObject>
			}>
		}
	}
	components: {
		types: DataItemDescriptor
		properties: DataItemDescriptor<{
			[key: string]: DataItemDescriptor
		}>
	}
	deviceTypes: 'android' | 'ios' | 'web'
	styles: {}
	references: {
		strings: string[]
		objects: Record<string, any>[]
	}
	userEvents: {
		[userEvent: string]: DataItemDescriptor<{
			components?: OrArray<nt.ComponentObject>
		}>
	}
}
