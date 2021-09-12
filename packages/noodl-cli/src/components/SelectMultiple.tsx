import React from 'react'
import InkSelectMultiple from 'ink-multi-select'

function SelectMultiple({ options, selected, ...rest }: any) {
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
