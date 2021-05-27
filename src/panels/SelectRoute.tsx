import React from 'react'
import * as u from '@jsmanifest/utils'
import Panel from '../components/Panel'
import Select from '../components/Select'
import useCtx from '../useCtx'

function SelectRoute({ header = 'Select an option' }: { header?: string }) {
	const { panel, highlight, setPanel, updatePanel } = useCtx()

	return (
		<Panel header={header}>
			<Select
				items={u.values(panel)}
				initialIndex={0}
				onHighlight={(item: any) => highlight(item.value)}
				onSelect={(item: any) => setPanel(item.value)}
			/>
		</Panel>
	)
}

export default SelectRoute
