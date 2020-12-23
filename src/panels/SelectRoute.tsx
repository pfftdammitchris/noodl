import React from 'react'
import { Box, Newline, Text } from 'ink'
import Select from 'ink-select-input'
import useCtx from '../useCtx'

function SelectRoute({ label = 'Select an option' }: any) {
	const { mergeToPanel } = useCtx()

	const items = [
		{ label: 'Fetch objects', value: 'fetch-objects' },
		{ label: 'Fetch keywords', value: 'fetch-keywords' },
	]

	const onHighlightPanel = React.useCallback(
		(item) => mergeToPanel({ highlightedId: item.value }),
		[],
	)

	const onSelectPanel = React.useCallback(
		(item) => mergeToPanel({ id: item.value, label: item.label }),
		[],
	)

	return (
		<Box padding={1} flexDirection="column">
			<Text color="yellow">{label}</Text>
			<Newline />
			<Select
				indicatorComponent={({ children, isSelected }) => (
					<Text color={isSelected ? 'magentaBright' : undefined}>
						{isSelected ? '>' : null} {children}
					</Text>
				)}
				initialIndex={0}
				items={items}
				onHighlight={onHighlightPanel}
				onSelect={onSelectPanel}
			/>
		</Box>
	)
}

export default SelectRoute
