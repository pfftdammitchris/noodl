import * as u from '@jsmanifest/utils'
import React from 'react'
import Panel from '../components/Panel'
import Select, { SelectInputProps } from '../components/Select'
import useCtx from '../useCtx'

function SelectRoute({ header = 'Select an option' }: { header?: string }) {
	const { panels, highlight, setPanel } = useCtx()

	console.log(panels)

	return

	const items = React.useMemo(
		() =>
			u.reduce(
				u.entries(panels),
				(acc, [value, panel]) => {
					return acc.concat({ value, label: panel.label })
				},
				[] as NonNullable<SelectInputProps['items']>,
			),
		[],
	)

	return (
		<Panel header={header}>
			<Select
				items={items}
				initialIndex={0}
				onHighlight={(item: any) => highlight(item.value)}
				onSelect={(item: any) => setPanel(item.value)}
			/>
		</Panel>
	)
}

export default SelectRoute
