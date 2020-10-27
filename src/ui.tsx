import React from 'react'
import BigText from 'ink-big-text'
import ConfirmInput from 'ink-confirm-input'
import Divider from 'ink-divider'
import Spinner from 'ink-spinner'
import ProgressBar from 'ink-progress-bar'
import SelectInput from 'ink-select-input'
import TextInput from 'ink-text-input'
import {
	Box,
	Newline,
	Spacer,
	Static,
	Text,
	Transform,
	useInput,
	useStdin,
	useStdout,
} from 'ink'
import * as C from './constants'
import * as T from './types'

const initialState = {
	script: {
		selected: '',
	},
}

function App() {
	const [state, setState] = React.useState(initialState)
	const { write } = useStdout()

	const scriptsList: { value: T.ScriptId; label: React.ReactNode }[] = [
		{
			label: 'Retrieve NOODL objects (JSON)',
			value: C.RETRIEVE_NOODL_OBJECTS_JSON,
		},
		{
			label: 'Retrieve NOODL objects (YML)',
			value: C.RETRIEVE_NOODL_OBJECTS_YML,
		},
		{
			label: 'Retrieve NOODL properties',
			value: C.RETRIEVE_NOODL_PROPERTIES,
		},
		{
			label: 'Retrieve NOODL objects with key(s)',
			value: C.RETRIEVE_NOODL_OBJECTS_WITH_KEYS,
		},
	] as const

	return (
		<Box padding={3} flexDirection="column">
			<Text color="yellow">
				Choose an option:
				<Newline />
			</Text>
			<Box flexDirection="column">
				<SelectInput items={scriptsList} />
			</Box>
		</Box>
	)
}

export default App
