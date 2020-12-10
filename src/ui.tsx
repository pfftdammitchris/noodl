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
import * as C from './constants'
import * as T from './types'
import AggregateObjects from './api/Aggregator'
import { prettifyErr } from './utils/common'
import * as panel from './panels'

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
			// console.log(item)
		},
		[],
	)

	React.useEffect(() => {
		const aggregator = new AggregateObjects({
			env: 'test',
			endpoint: 'https://public.aitmed.com/config/meet2d.yml',
		})
		const { base, app } = aggregator

		base.on('root.config', () => {
			console.log(`Received ${chalk.magenta('root config')}`)
		})

		base.on('version', (version) => {
			console.log(`Version set to: ${chalk.magenta(version)}`)
		})

		base.on('app.endpoint', (endpoint) => {
			console.log(`App endpoint: ${chalk.magenta(endpoint)}`)
		})

		base.on('app.config', (config) => {
			console.log(`Received ${chalk.magenta('app config')}`)
		})

		base.on('base.url', (baseUrl) => {
			console.log(`Base url: ${chalk.magenta(baseUrl)}`)
		})

		base.on('app.base.url', (appBaseUrl) => {
			console.log(`App base url: ${chalk.magenta(appBaseUrl)}`)
		})

		aggregator
			.init()
			.then(({ base, pages }) => {
				// console.log(base)
				console.log('start')
				console.log(pages)
				console.log('end')
			})
			.catch((err) => {
				console.log(err)
				console.log(prettifyErr(err))
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
