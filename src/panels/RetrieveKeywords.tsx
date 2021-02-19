import React from 'react'
import chalk from 'chalk'
import { Box, Newline, Text } from 'ink'
import TextInput from 'ink-text-input'

function RetrieveKeywords() {
	const [keywords, setKeywords] = React.useState<string[]>([])
	const [keyword, setKeyword] = React.useState('')

	const onSubmitKeyword = React.useCallback(
		(value: string) => {
			if (value && !keywords.includes(value)) {
				setKeywords((prev) => prev.concat(value))
				setKeyword('')
			}
		},
		[keywords],
	)

	return (
		<Box padding={1} flexDirection="column">
			<Text>{chalk.yellow(String(keywords.length))} keywords entered</Text>
			{keywords.length ? (
				<>
					<Newline />
					<Text>{keywords.map((str) => `${chalk.magenta(str)} `)}</Text>
				</>
			) : null}
			<Newline />
			<Box flexDirection="column">
				<TextInput
					value={keyword}
					onChange={(value) => value !== keyword && setKeyword(value)}
					onSubmit={onSubmitKeyword}
					placeholder="Type your keyword here"
				/>
			</Box>
		</Box>
	)
}

export default RetrieveKeywords
