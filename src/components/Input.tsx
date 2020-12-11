import React from 'react'
import { Box, Text } from 'ink'
import TextInput from 'ink-text-input'

function Input() {
	const [query, setQuery] = React.useState('')

	return (
		<Box>
			<Box marginRight={1}>
				<Text>Enter your query:</Text>
			</Box>
			<TextInput value={query} onChange={setQuery} />
		</Box>
	)
}

export default Input
