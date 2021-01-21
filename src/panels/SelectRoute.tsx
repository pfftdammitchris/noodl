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
	const { getConsumerConfig, setPanel } = useCtx()
	const [initialIndex, setInitialIndex] = React.useState<null | number>(null)

	React.useEffect(() => {
		const consumerConfig = getConsumerConfig()
		if (consumerConfig) {
			if (consumerConfig.initialOption) {
				if (panelMap[consumerConfig.initialOption as PanelId]) {
					setInitialIndex(
						panels.findIndex(
							(p) => p.id === consumerConfig.initialOption,
						) as any,
					)
					return
				}
			}
		}
		setInitialIndex(0)
	}, [])

	if (initialIndex === null) return null

	return (
		<Box padding={1} flexDirection="column">
			<Text color="yellow">{label}</Text>
			<Newline />
			<Select
				items={panels}
				initialIndex={initialIndex}
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
