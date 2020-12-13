import React from 'react'
import InkSelectMultiple, { MultiSelectProps } from 'ink-multi-select'
import { PanelSelectMultipleConfig } from '../types'

function SelectMultiple({
	options,
	selectedOptions,
	...rest
}: MultiSelectProps & PanelSelectMultipleConfig['panel']) {
	return (
		<InkSelectMultiple
			selected={selectedOptions}
			items={options?.map((option) => ({
				value: typeof option === 'string' ? option : option.value,
				label: typeof option === 'string' ? option : option.label,
			}))}
			{...rest}
		/>
	)
}

export default SelectMultiple
