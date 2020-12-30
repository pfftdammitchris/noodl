import React from 'react'
import { Box, Newline, Text } from 'ink'
import { panelId } from '../constants'
import Select from '../components/Select'
import useCtx from '../useCtx'

function SelectRoute({ label = 'Select an option' }: any) {
	const { setPanel } = useCtx()

	const items = [
		{ label: 'Fetch objects', value: panelId.RETRIEVE_OBJECTS },
		{ label: 'Fetch keywords', value: panelId.RETRIEVE_KEYWORDS },
		{ label: 'Start server', value: panelId.START_SERVER },
	]

	const onHighlightPanel = React.useCallback(
		(item) => setPanel({ highlightedId: item.value }),
		[],
	)

	const onSelectPanel = React.useCallback(
		(item) => setPanel({ id: item.value, label: item.label }),
		[],
	)

	return (
		<Box padding={1} flexDirection="column">
			<Text color="yellow">{label}</Text>
			<Newline />
			<Select
				items={items}
				onHighlight={onHighlightPanel}
				onSelect={onSelectPanel}
			/>
		</Box>
	)
}

export default SelectRoute
