import React from 'react'
import InkSelectMultiple, { MultiSelectProps } from 'ink-multi-select'

export interface SelecetMultipleProps extends MultiSelectProps {}

function SelectMultiple(props: SelecetMultipleProps) {
	return <InkSelectMultiple {...props} />
}

export default SelectMultiple
