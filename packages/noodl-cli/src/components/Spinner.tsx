import React from 'react'
import InkSpinner from 'ink-spinner'

export interface SpinnerProps {
	type?: string
	interval?: number
}

function Spinner(props: SpinnerProps) {
	const implicitProps = { interval: 80 } as any
	console.info({
		props,
		implicitProps,
	})

	const spinner = <InkSpinner {...props} {...implicitProps} type="point" />

	return spinner
}

export default Spinner
