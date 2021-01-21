import React from 'react'
import useCtx from '../useCtx'
import { CLIConfigObject } from '../types'
import cliConfig from '../cliConfig'

export interface SettingsProps {
	defaults?: Partial<CLIConfigObject>
}

function Settings({ defaults }: SettingsProps) {
	const { getConsumerConfig, setCaption } = useCtx()

	React.useEffect(() => {
		const consumerConfig = getConsumerConfig()
		cliConfig.merge({ ...defaults, ...consumerConfig })
		setCaption('Initialized')
	}, [])

	return null
}

export default Settings
