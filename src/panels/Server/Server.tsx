import React from 'react'
import * as u from '@jsmanifest/utils'
import { Box, Newline, Text } from 'ink'
import TextInput from 'ink-text-input'
import useConfigInput from '../../hooks/useConfigInput'
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

function Server({ config: configProp, host, local, port, watch: enableWatch, wss: enableWss }: Props) {
	const { log, toggleSpinner } = useCtx()

	const { config, inputValue, setInputValue, valid, validate, validating, } =
		useConfigInput({
			initialConfig: configProp,
			onValidateStart() {
				toggleSpinner()
			},
			onValidateEnd() {
				toggleSpinner(false)
			},
			onNotFound(configKey) {
				log(u.red(`The config "${configKey}" does not exist`))
			},
			onError(error) {
				log(`[${u.red(error.name)}] ${u.yellow(error.message)}`)
			},
		})

	const { listen, server, watching, wss } = useServer({
		host: host as string,
		local: !!local,
		port: port as number,
		watch: !!enableWss,
		wss: !!enableWss,
	})

	React.useEffect(() => {
		if (!valid || server.current) return
		if (enableWatch && !watching) return
		if (enableWss && !wss.current) return
		listen()
	}, [enableWatch, enableWss, server, valid, watching, wss])

	

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
							value={inputValue}
							onChange={setInputValue}
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
