import React from 'react'
import fs from 'fs-extra'
import merge from 'lodash/merge'
import CLIConfigBuilder from '../builders/CLIConfig'
import useCtx from '../useCtx'
import {
	DEFAULT_CONFIG_PATH,
	DEFAULT_SERVER_PATH,
	DEFAULT_SERVER_PORT,
	DEFAULT_SERVER_URL,
} from '../constants'
import { ConsumerCLIConfigObject } from '../types'

function Settings() {
	const [initialized, setInitialized] = React.useState(false)
	const {
		server,
		objects,
		setCaption,
		setObjectsJsonOptions,
		setObjectsYmlOptions,
		setServerOptions,
	} = useCtx()

	const getConsumerConfig = React.useCallback(
		(): ConsumerCLIConfigObject | undefined =>
			fs.existsSync(DEFAULT_CONFIG_PATH)
				? (fs.readJsonSync(DEFAULT_CONFIG_PATH) as ConsumerCLIConfigObject)
				: undefined,
		[],
	)

	React.useEffect(() => {
		const consumerConfig = getConsumerConfig()
		const configBuilder = new CLIConfigBuilder({
			...consumerConfig,
			server: {
				...consumerConfig?.server,
				dir: consumerConfig?.server.dir || DEFAULT_SERVER_PATH,
			},
		} as ConsumerCLIConfigObject)
		const cliConfig = configBuilder.toJS()
		setServerOptions({
			dir: cliConfig.server.dir || DEFAULT_SERVER_PATH,
			port: cliConfig.server.port || DEFAULT_SERVER_PORT,
			host: DEFAULT_SERVER_URL,
		})
		setObjectsJsonOptions({ dir: cliConfig.objects.json.dir })
		setObjectsYmlOptions({ dir: cliConfig.objects.yml.dir })
		setInitialized(true)
		setCaption('Initialized')
	}, [])

	React.useEffect(() => {
		if (initialized) {
			const cliConfig = getConsumerConfig()
			if (cliConfig) {
				fs.writeJsonSync(DEFAULT_CONFIG_PATH, merge({ server, objects }))
			}
		}
	}, [initialized, server, objects])

	return null
}

export default Settings
