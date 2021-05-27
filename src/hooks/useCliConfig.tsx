import React from 'react'
import * as u from '@jsmanifest/utils'
import merge from 'lodash/merge'
import fs from 'fs-extra'
import produce, { Draft } from 'immer'
import CliConfigBuilder from '../builders/CliConfig'
import { getAbsFilePath, getCliConfig, hasCliConfig } from '../utils/common'
import { App, CliConfigObject } from '../types'

const cliConfig = new CliConfigBuilder()

type State = typeof initialState

const initialState = {
	...(cliConfig.toJSON() as CliConfigObject),
	defaultOption: null as App.PanelKey | null,
}

function useCliConfig(overrideSettings?: Record<string, any>) {
	const isMounted = React.useRef(false)
	const [settings, setSettings] = React.useState<State>(() => {
		const _settings = { ...initialState }
		if (hasCliConfig()) {
			const cfgObject = getCliConfig()
			if (u.isObj(cfgObject)) {
				// @ts-expect-error
				u.entries(cfgObject).forEach(([k, v]) => (_settings[k] = v))
			}
		}
		return merge(_settings, overrideSettings)
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
			if (fs.existsSync(getAbsFilePath('noodl.yml'))) {
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
