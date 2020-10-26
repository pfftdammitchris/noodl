import React from 'react'
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

function App({ cli }) {
	const [value, setValue] = React.useState('')
	const { write } = useStdout()

	return (
		<Box padding={3}>
			<Text>Choose an option:</Text>
			<Text>Retrieve NOODL objects</Text>
		</Box>
	)
}

export default App
