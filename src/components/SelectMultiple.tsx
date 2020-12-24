import React from 'react'
import InkSelectMultiple, { MultiSelectProps } from 'ink-multi-select'

// @ts-expect-error
function SelectMultiple({ options, selected, ...rest }: MultiSelectProps) {
	return (
		<InkSelectMultiple
			selected={selected}
			items={options?.map((option: any) => ({
				key: typeof option === 'string' ? option : option.value,
				value: typeof option === 'string' ? option : option.value,
				label: typeof option === 'string' ? option : option.label,
			}))}
			{...rest}
		/>
	)
}

export default SelectMultiple
