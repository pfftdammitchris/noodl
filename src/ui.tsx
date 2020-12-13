import React from 'react'
import chalk from 'chalk'
import { Box, Newline, Text } from 'ink'
import Select from 'ink-select-input'
import { ListedItem } from 'ink-multi-select'
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

	const setPanel = React.useCallback((panel: T.PanelConfig | string) => {
		console.log(
			`\nSelected panel: ${chalk.yellow(JSON.stringify(panel, null, 2))}`,
		)
		internalSetState({
			panel: typeof panel === 'string' ? getPanel(panel) : panel,
		})
	}, [])

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

	const onSelectMultipleSubmit = React.useCallback((items: ListedItem[]) => {
		console.log(`Selecting multiple options: ${JSON.stringify(items, null, 2)}`)
	}, [])

	const onSelectMultipleItemSelect = React.useCallback((item: ListedItem) => {
		console.log(`Selected option: ${JSON.stringify(item, null, 2)}`)
	}, [])

	React.useEffect(() => {
		aggregator = createAggregator({
			config: 'message',
		})
	}, [])

	return (
		<Box padding={3} flexDirection="column">
			<Text color="yellow">
				{state.panel?.label || state.panel?.panel?.label}
				<Newline />
			</Text>
			<Box flexDirection="column">
				{state.panel.type === 'select' ? (
					<Select
						initialIndex={0}
						items={state.panel.items}
						onSelect={setPanel as any}
					/>
				) : state.panel.type === 'select-multiple' ? (
					<SelectMultiple
						defaultSelected={
							typeof state.panel.options === 'string'
								? {
										label: state.panel.options,
										key: state.panel.options,
										value: state.panel.options,
								  }
								: state.panel.options?.[0]
						}
						options={state.panel.panel.options}
						selectedOptions={state.panel.panel.selectedOptions}
						onSubmit={onSelectMultipleSubmit}
						onSelect={onSelectMultipleItemSelect}
					/>
				) : state.panel.type === 'input' ? (
					<Input />
				) : null}
			</Box>
		</Box>
	)
}

export default App
