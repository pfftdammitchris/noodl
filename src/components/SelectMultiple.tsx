import React from 'react'
import InkSelectMultiple, { MultiSelectProps } from 'ink-multi-select'
import { PanelConfig } from '../types'

export interface SelecetMultipleProps extends MultiSelectProps {}

function SelectMultiple({
	options,
	items = options,
	...rest
}: SelecetMultipleProps & { options?: PanelConfig[] }) {
	return (
		<InkSelectMultiple
			items={items?.map((item) => ({
				value: typeof item === 'string' ? item : item.value,
				label: typeof item === 'string' ? item : item.label,
			}))}
			{...rest}
		/>
	)
}

export default SelectMultiple
