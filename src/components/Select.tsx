import React from 'react'
import SelectInput from 'ink-select-input'
import { PanelConfig } from '../types'

export type SelectInputProps = Parameters<typeof SelectInput>[0]

function Select(
	props: {
		panels: PanelConfig[]
	} & SelectInputProps,
) {
	return <SelectInput {...props} />
}

export default Select
