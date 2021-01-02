import React from 'react'
import { Text, TextProps } from 'ink'

function HighlightedText({
	children,
	...rest
}: React.PropsWithChildren<any> & TextProps) {
	return (
		<Text color="yellow" {...rest}>
			{children}
		</Text>
	)
}

export default HighlightedText
