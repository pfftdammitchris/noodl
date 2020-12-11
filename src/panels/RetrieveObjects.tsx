import React from 'react'
import produce, { Draft } from 'immer'
import SelectInput, { SelectInputProps } from '../components/SelectMultiple'

type Action =
	| { type: 'add-json'; name: string; object: any }
	| { type: 'add-yml'; name: string; object: any }

interface State {
	json: Record<string, any>
	yml: Record<string, string>
}

const initialState: State = {
	json: {},
	yml: {},
}

const reducer = produce((draft: Draft<State>, action: Action) => {
	switch (action.type) {
		case 'add-json':
			return void (draft.json[action.name] = action.object)
		case 'add-yml':
			return void (draft.yml[action.name] = action.object)
	}
})

function RetrieveObjectsPanel({ onSelect }) {
	const [state, dispatch] = React.useReducer(reducer, initialState)

	const add = React.useCallback(
		(type: 'json' | 'yml', name: string, object: any) => {
			dispatch({ type: `add-${type}` as 'add-json' | 'add-yml', name, object })
		},
		[],
	)

	React.useEffect(() => {}, [])

	return (
		<SelectInput
			initialIndex={0}
			items={[]}
			// onHighlight={}
			onSelect={onSelect}
		/>
	)
}

export default RetrieveObjectsPanel
