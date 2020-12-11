import React from 'react'
import { Box, Newline, Text } from 'ink'
import Select from 'ink-select-input'
import SelectMultiple from './components/SelectMultiple'
import Input from './components/Input'
import createAggregator from './api/createAggregator'
import getPanel from './getPanel'
import * as c from './constants'
import * as T from './types'

let aggregator: ReturnType<typeof createAggregator>

const initialState: { panel: T.PanelConfig } = {
	panel: getPanel(c.panel.INIT),
}

function App() {
	const [state, setState] = React.useState(initialState)

	const internalSetState = React.useCallback(
		(s: ((s: typeof state) => typeof state | void) | typeof state) => {
			if (typeof s === 'function') {
				setState((prevState) => {
					const newState = s(prevState)
					if (!newState || newState === prevState) return prevState
					return { ...prevState, ...newState }
				})
			} else {
				setState((prevState) => ({ ...prevState, ...s }))
			}
		},
		[],
	)

	const onSelectPanel = React.useCallback((panel: T.PanelConfig) => {
		internalSetState({ panel })
	}, [])

	const onSelectMultipleSubmit = React.useCallback((items) => {
		console.log(items)
	}, [])

	React.useEffect(() => {
		aggregator = createAggregator({
			config: 'message',
		})
	}, [])

	return (
		<Box padding={3} flexDirection="column">
			<Text color="yellow">
				{state.panel?.label}
				<Newline />
			</Text>
			<Box flexDirection="column">
				{state.panel.type === 'select' ? (
					<Select
						initialIndex={0}
						items={state.panel.items}
						onSelect={onSelectPanel}
					/>
				) : state.panel.type === 'select-multiple' ? (
					<SelectMultiple />
				) : state.panel.type === 'input' ? (
					<Input />
				) : null}
			</Box>
		</Box>
	)
}

export default App
