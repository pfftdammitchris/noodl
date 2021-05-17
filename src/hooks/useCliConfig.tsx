import React from 'react'
import isPlainObject from 'lodash/isPlainObject'
import fs from 'fs-extra'
import produce, { Draft } from 'immer'
import CliConfigBuilder from '../builders/CliConfig'
import { getFilePath, getCliConfig, hasCliConfig } from '../utils/common'
import { App } from '../types'

const cliConfig = new CliConfigBuilder()

type State = typeof initialState

const initialState = {
	...(cliConfig.toJSON() as App.CliConfigObject),
	defaultOption: null as App.PanelId | null,
}

function useCliConfig() {
	const isMounted = React.useRef(false)
	const [settings, setSettings] = React.useState<State>(() => {
		const _settings = { ...initialState }
		if (hasCliConfig()) {
			const cfgObject = getCliConfig()
			if (isPlainObject(cfgObject)) {
				Object.entries(cfgObject).forEach(([k, v]) => (_settings[k] = v))
			}
		}
		return _settings
	})

	const set = React.useCallback((fn: (draft: Draft<State>) => void) => {
		setSettings(produce(fn))
	}, [])

	const save = (_state?: State) => {
		cliConfig.save(_state)
	}

	React.useEffect(() => {
		if (isMounted.current) {
			// Only refresh/save the config to dir if they created it
			if (fs.existsSync(getFilePath('noodl.yml'))) {
				save(settings)
			} else {
				//
			}
		}
		isMounted.current = true
	}, [isMounted.current, settings])

	return {
		...settings,
		save,
		set,
	}
}

export default useCliConfig
