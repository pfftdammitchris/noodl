import React from 'react'
import { Box, Newline, Text } from 'ink'
import Select from '../../components/Select'
import useCtx from '../../useCtx'

export interface OutputDirProps {
	value: string
	onConfirm?(): void
}

function OutputDir({ onConfirm, value }: OutputDirProps) {
	const [done, setDone] = React.useState(false)
	const { configuration } = useCtx()

	React.useEffect(() => {
		if (value && !done) {
			configuration.setPathToGenerateDir(value)
			setDone(true)
		}
	}, [done, value])

	if (done) {
		return (
			<Box flexDirection="column">
				<Text color="white">
					Output directory was set to{' '}
					<Text color="yellow">{configuration.getPathToGenerateDir()}</Text>
				</Text>
				<Box paddingTop={1}>
					<Select items={[{ value: 'ok', label: 'Ok' }]} onSelect={onConfirm} />
				</Box>
			</Box>
		)
	}

	return null
}

export default OutputDir
