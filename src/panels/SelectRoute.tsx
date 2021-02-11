import React from 'react'
import { Box, Newline, Text } from 'ink'
import { panel as panelMap, panelId } from '../constants'
import { PanelId } from '../types'
import Select from '../components/Select'
import useCtx from '../useCtx'

const panels = Object.values(panelMap).reduce((acc, obj) => {
	if (obj.id === panelId.SELECT_ROUTE) return acc
	return acc.concat({
		id: obj.id,
		label: obj.label,
		value: obj.id,
	} as any)
}, [] as (typeof panelMap[keyof typeof panelMap] & { value: PanelId })[])

function SelectRoute({ label = 'Select an option' }: any) {
	const { cliConfig, setPanel } = useCtx()

	const initialIndex =
		(panelMap[cliConfig.defaultOption] &&
			panels.findIndex((p) => p.id === cliConfig.defaultOption)) ||
		0

	return (
		<Box padding={1} flexDirection="column">
			<Text color="yellow">{label}</Text>
			<Newline />
			<Select
				items={panels}
				initialIndex={initialIndex === -1 ? 0 : initialIndex}
				onHighlight={(item) =>
					setPanel({ highlightedId: item.value as string })
				}
				onSelect={(item) =>
					setPanel({ id: item.value, label: item.label } as any)
				}
			/>
		</Box>
	)
}

export default SelectRoute
