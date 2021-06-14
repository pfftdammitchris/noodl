import React from 'react'
import { Box, Newline, Text } from 'ink'
import TextInput from 'ink-text-input'
import useCtx from '../../useCtx'
import useServer from './useServer'

export interface Props {
	config: string
	host?: string
	local?: boolean
	port?: number
	wss?: boolean
	wssPort?: number
	watch?: boolean
}

function Server({
	config: consumerConfigValue,
	host,
	local,
	port,
	watch,
	wss,
	wssPort,
}: Props) {
	const { config, configInput, setConfigInputValue, validating, validate } =
		useServer({
			consumerConfigValue,
			host,
			local: !!local,
			port,
			watch: !!watch,
			wss: !!wss,
			wssPort,
		})

	if (!config) {
		return (
			<Box padding={1} flexDirection="column">
				{validating ? (
					<Text color="white">
						Validating <Text color="yellow">{config}</Text>
						<Text>...</Text>
					</Text>
				) : (
					<>
						<Text>
							What config should we use? (example:{' '}
							<Text color="yellow">meet4d</Text>)
						</Text>
						<Newline />
						<TextInput
							value={configInput}
							onChange={setConfigInputValue}
							onSubmit={validate}
							placeholder={`Enter config`}
						/>
					</>
				)}
			</Box>
		)
	}

	return null
}

export default Server
