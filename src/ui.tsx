import React from 'react'
import { Box, Newline, Text } from 'ink'
import Select from 'ink-select-input'
import usePanels from './getPanel'
import SelectMultiple from './components/SelectMultiple'
import Input from './components/Input'
import createAggregator from './api/createAggregator'

let aggregator: ReturnType<typeof createAggregator>


function App() {
	const {
		panel,
		setPanel,
		onSelectMultipleSubmit,
	} = usePanels({ aggregator })

	return (
		<Box padding={3} flexDirection="column">
			<Text color="yellow">
				{panel?.label || panel?.label}
				<Newline />
			</Text>
			<Box flexDirection="column">
				{panel.type === 'select' ? (
					<Select
						initialIndex={0}
						items={panel.items}
						onSelect={setPanel}
					/>
				) : panel.type === 'select-multiple' ? (
					<SelectMultiple
						options={panel.options}
						selected={panel.selected}
						onSubmit={onSelectMultipleSubmit}
					/>
				) : panel.type === 'input' ? (
					<Input />
				) : null}
			</Box>
		</Box>
	)
}

export default App
