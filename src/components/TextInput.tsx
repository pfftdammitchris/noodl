import React from 'react'
import InkTextInput from 'ink-text-input'

const TextInputComponent =
	// @ts-expect-error
	InkTextInput.default as React.FC<typeof InkTextInput.defaultProps>

export type TextProps = Partial<typeof InkTextInput['defaultProps']> & {
	children?: React.ReactNode
}

function TextInput({ children, ...rest }: TextProps) {
	return <TextInputComponent {...rest}>{children}</TextInputComponent>
}

export default TextInput
