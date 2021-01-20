import React from 'react'
import fs from 'fs-extra'
import useCtx from '../useCtx'
import { DEFAULT_CONFIG_FILEPATH } from '../constants'
import { CLIConfigObject } from '../types'
import { getFilePath } from '../utils/common'
import cliConfig from '../cliConfig'

export interface SettingsProps {
	defaults?: Partial<CLIConfigObject>
}

function Settings({ defaults }: SettingsProps) {
	const { setCaption, setErrorCaption } = useCtx()

	const getConsumerConfig = React.useCallback(():
		| CLIConfigObject
		| undefined => {
		const configPath = getFilePath(DEFAULT_CONFIG_FILEPATH)
		let configObj: any
		try {
			configObj = fs.readJsonSync(configPath)
		} catch (error) {
			setErrorCaption(error)
		}
		return configObj
	}, [])

	React.useEffect(() => {
		cliConfig.merge({ ...defaults, ...getConsumerConfig() })
		setCaption('Initialized')
	}, [])

	return null
}

export default Settings
