import React from 'react'
import fs from 'fs-extra'
import CLIConfigBuilder from '../builders/CLIConfig'
import useCtx from '../useCtx'
import { DEFAULT_CONFIG_PATH } from '../constants'
import { CLIConfigObject } from '../types'
import { getFilePath } from '../utils/common'

function Settings({
	server: serverProp,
	objects: objectsProp,
}: Partial<CLIConfigObject>) {
	const {
		setCaption,
		setErrorCaption,
		setObjectsJsonOptions,
		setObjectsYmlOptions,
		setServerOptions,
	} = useCtx()

	const getConsumerConfig = React.useCallback(():
		| CLIConfigObject
		| undefined => {
		const configPath = getFilePath(DEFAULT_CONFIG_PATH)
		let configObj: any
		try {
			configObj = fs.readJsonSync(configPath)
		} catch (error) {
			setErrorCaption(error)
		}
		return configObj
	}, [])

	React.useEffect(() => {
		const configBuilder = new CLIConfigBuilder({
			server: serverProp,
			objects: objectsProp,
			...getConsumerConfig(),
		})
		const cliConfig = configBuilder.toJS()
		setServerOptions(cliConfig.server)
		setObjectsJsonOptions(cliConfig.objects.json)
		setObjectsYmlOptions(cliConfig.objects.yml)
		setCaption('Initialized')
	}, [])

	return null
}

export default Settings
