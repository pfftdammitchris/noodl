import React from 'react'
import InkTextInput from 'ink-text-input'

export type TextProps = typeof InkTextInput['defaultProps'] & {
	children?: React.ReactNode
}

function TextInput({ children, ...rest }: TextProps) {
	// @ts-expect-error
	return <InkTextInput {...rest}>{children}</InkTextInput>
}

export default TextInput
