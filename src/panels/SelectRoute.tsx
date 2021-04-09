import React from 'react'
import { Box, Newline, Text } from 'ink'
import { panel as panelMap } from '../constants'
import { values } from '../utils/common'
import { App } from '../types'
import Select from '../components/Select'
import useCtx from '../useCtx'

const panels = values(panelMap)

function SelectRoute({ header = 'Select an option' }: { header?: string }) {
	const { settings, updatePanel } = useCtx()

	const initialIndex =
		(panelMap[settings.defaultOption as App.PanelId] &&
			panels.findIndex((p) => p.value === settings.defaultOption)) ||
		0

	return (
		<Box padding={1} flexDirection="column">
			<Text color="yellow">{header}</Text>
			<Newline />
			<Select
				items={panels}
				initialIndex={initialIndex === -1 ? 0 : initialIndex}
				onHighlight={(item: any) => updatePanel({ highlightedId: item.value })}
				onSelect={(item: any) => updatePanel(item)}
			/>
		</Box>
	)
}

export default SelectRoute
