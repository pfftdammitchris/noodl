import React from 'react'
import chalk from 'chalk'
import BigText from 'ink-big-text'
import ConfirmInput from 'ink-confirm-input'
import Divider from 'ink-divider'
import Spinner from 'ink-spinner'
import ProgressBar from 'ink-progress-bar'
import SelectInput, {
	ItemProps as ISelectInputItemProps,
} from 'ink-select-input'
import TextInput from 'ink-text-input'
import { Box, Newline, Spacer, Static, Text, useInput, useStdout } from 'ink'
import * as c from './constants'
import * as T from './types'
import createAggregator from './api/createAggregator'
import { prettifyErr } from './utils/common'
import * as panel from './panels'

let aggregator: ReturnType<typeof createAggregator>
// const panelMap =

const initialState = {
	panels: Object.values(panel).reduce(
		(acc, panel) => acc.concat(panel as T.PanelConfig),
		[] as T.PanelConfig[],
	),
	selected: panel.init,
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

	const onHighlightScript = React.useCallback(
		(item: typeof state.panels[number]) => {
			// console.log(item)
		},
		[],
	)

	const onSelectScript = React.useCallback(
		(item: typeof state.panels[number]) => {
			if (item.value === c.panel.RETRIEVE_OBJECTS) {
				internalSetState({ selected: state.panels })
			}
		},
		[],
	)

	React.useEffect(() => {
		aggregator = createAggregator({
			config: 'message',
		})
	}, [])

	return (
		<Box padding={3} flexDirection="column">
			<Text color="yellow">
				{state.selected.label}
				<Newline />
			</Text>
			<Box flexDirection="column">
				<SelectInput
					items={state.panels}
					indicatorComponent={({ isSelected }) =>
						isSelected ? <Text color="magenta">{'> '}</Text> : null
					}
					onHighlight={onHighlightScript}
					onSelect={onSelectScript}
				/>
			</Box>
		</Box>
	)
}

export default App
