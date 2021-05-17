import {
	ActionObject,
	ComponentObject,
	EmitObjectFold,
	IfObject,
	StyleBorderObject,
} from 'noodl-types'

export interface AggregatorStore {
	actions: Partial<Record<string, ActionObject[]>>
	actionTypes: string[]
	components: Partial<Record<string, ComponentObject[]>>
	componentKeys: string[]
	componentTypes: string[]
	emit: EmitObjectFold[]
	funcNames: string[]
	if: IfObject[]
	references: string[]
	styleKeys: string[]
	styles: {
		border: StyleBorderObject[]
	}
	urls: string[]
	propCombos: {
		actions: {
			[actionType: string]: { [key: string]: any[] }
		}
		components: {
			[componentType: string]: { [key: string]: any[] }
		}
	}
	containedKeys: {
		[keyword: string]: any[]
	}
	[key: string]: any
}
