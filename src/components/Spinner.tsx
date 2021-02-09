import React from 'react'
import InkSpinner from 'ink-spinner'

export interface SpinnerProps {
	type?: string
	interval?: number
}

function Spinner(props: SpinnerProps) {
	const implicitProps = { interval: 80 } as any
	return <InkSpinner type="point" {...props} {...implicitProps} />
}

export default Spinner
