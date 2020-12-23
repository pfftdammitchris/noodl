import React from 'react'
import produce, { Draft } from 'immer'
import SelectInput from '../components/SelectMultiple'
import { Box, Newline, Text } from 'ink'
import SelectMultiple from '../components/SelectMultiple'

type Ext = 'json' | 'yml'

export type Action =
	| { type: 'add-ext'; ext: Ext }
	| { type: 'remove-ext'; ext: Ext }
	| {
			type: 'add-object'
			json?: { [key: string]: { [key: string]: any } }
			yml?: { [key: string]: string }
	  }
	| { type: 'remove-object'; json?: string | string[]; yml?: string | string[] }

export interface State {
	exts: ('json' | 'yml')[]
	objects: {
		json: { [name: string]: { [key: string]: any } }
		yml: { [name: string]: string }
	}
}

const initialState: State = {
	exts: [],
	objects: {
		json: {},
		yml: {},
	},
}

const reducer = produce((draft: Draft<State>, action: Action) => {
	switch (action.type) {
		case 'add-ext':
			return void (
				!draft.exts.includes(action.ext) && draft.exts.push(action.ext)
			)
		case 'remove-ext':
			return void (
				draft.exts.includes(action.ext) &&
				draft.exts.splice(draft.exts.indexOf(action.ext), 1)
			)
		case 'add-object': {
			if (action.json) Object.assign(draft.objects.json, action.json)
			if (action.yml) Object.assign(draft.objects.yml, action.yml)
			break
		}
		case 'remove-object': {
			if (action.json) {
				;(Array.isArray(action.json) ? action.json : [action.json]).forEach(
					(key) => delete draft.objects.json[key],
				)
			}
			if (action.yml) {
				;(Array.isArray(action.yml) ? action.yml : [action.yml]).forEach(
					(key) => delete draft.objects.yml[key],
				)
			}
			break
		}
	}
})

function RetrieveObjectsPanel() {
	const [state, dispatch] = React.useReducer(reducer, initialState)

	const add = React.useCallback(
		(type: 'json' | 'yml', name: string, object: any) => {
			dispatch({ type: `add-${type}` as 'add-json' | 'add-yml', name, object })
		},
		[],
	)

	React.useEffect(() => {}, [])

	const items = [
		{ label: 'JSON', value: 'json' },
		{ label: 'YML', value: 'yml' },
	]

	return (
		<Box padding={1} flexDirection="column">
			<Text color="yellow">Include these extensions:</Text>
			<Newline />
			<Box>
				<SelectMultiple
					initialIndex={0}
					items={items}
					// onHighlight={}
				/>
			</Box>
		</Box>
	)
}

export default RetrieveObjectsPanel
