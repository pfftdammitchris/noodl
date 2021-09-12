import React from 'react'
import * as u from '@jsmanifest/utils'
import { Box, Newline, Text } from 'ink'

export interface PanelProps {
	header?: string | { color?: string; value: string }
	newline?: boolean
	children?: React.ReactNode
}

function Panel({ children, newline = true, header }: PanelProps) {
	return (
		<Box padding={1} flexDirection="column">
			{header &&
				(u.isStr(header) ? (
					<Text color="yellow">{header}</Text>
				) : (
					<Text color={header.color || 'yellow'}>{header.value}</Text>
				))}
			{newline && <Newline />}
			{children}
		</Box>
	)
}

export default Panel
