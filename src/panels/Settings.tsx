import React from 'react'
import useCtx from '../useCtx'
import { CLIConfigObject } from '../types'
import cliConfig from '../cliConfig'
import { getCliConfig } from '../utils/common'

export interface SettingsProps {
	defaults?: Partial<CLIConfigObject>
}

function Settings({ defaults }: SettingsProps) {
	const { setCaption } = useCtx()

	React.useEffect(() => {
		const consumerConfig = getCliConfig() as CLIConfigObject
		cliConfig.merge({ ...defaults, ...consumerConfig })
		setCaption('\nInitialized\n')
	}, [])

	return null
}

export default Settings
