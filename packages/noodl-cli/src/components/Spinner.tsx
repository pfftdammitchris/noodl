import React from 'react'
import InkSpinnerComponent from 'ink-spinner'

// @ts-expect-error
const InkSpinner = InkSpinnerComponent.default

export interface SpinnerProps {
	type?: string
	interval?: number
}

function Spinner(props: SpinnerProps) {
	const implicitProps = { interval: 80 } as any
	return <InkSpinner type="point" {...props} {...implicitProps} />
}

export default Spinner
