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
		<Box padding={3} flexDirection="column">
			<Text color="yellow">Choose an option:</Text>
			<Newline />
			<Text>
				<Text color="magenta">JSON</Text>)
			</Text>
			<Text>
				Retrieve NOODL objects (<Text color="magenta">YML</Text>)
			</Text>
		</Box>
	)
}

export default App
