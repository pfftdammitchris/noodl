import React from 'react'
import InkSelectMultiple, { MultiSelectProps } from 'ink-multi-select'
import { PanelSelectMultipleConfig } from '../types'

function SelectMultiple({
	options,
	selected,
	...rest
}: MultiSelectProps & PanelSelectMultipleConfig['panel']) {
	return (
		<InkSelectMultiple
			selected={selected}
			items={options?.map((option) => ({
				key: typeof option === 'string' ? option : option.value,
				value: typeof option === 'string' ? option : option.value,
				label: typeof option === 'string' ? option : option.label,
			}))}
			{...rest}
		/>
	)
}

export default SelectMultiple
