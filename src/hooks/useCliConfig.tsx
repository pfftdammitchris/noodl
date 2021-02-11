import React from 'react'
import fs from 'fs-extra'
import yaml from 'yaml'
import produce, { Draft } from 'immer'
import merge from 'lodash/merge'
import CliConfigBuilder from '../builders/CliConfig'
import { getFilePath, getCliConfig, hasCliConfig } from '../utils/common'
import { CliConfigObject, PanelId } from '../types'
import * as c from '../constants'

type State = typeof initialState

const initialState = {
	defaultOption: c.panelId.SELECT_ROUTE as PanelId,
	server: {
		dir: '',
		host: '',
		port: 0,
		protocol: '',
		config: '',
	} as CliConfigObject['server'],
	objects: {
		json: { dir: [] as string[] },
		yml: { dir: [] as string[] },
	},
}

function useCliConfig() {
	const { current: configPath } = React.useRef<string>(getFilePath('noodl.yml'))
	const [state, setState] = React.useState<State>(() => {
		if (hasCliConfig()) return merge({}, initialState, getCliConfig())
		else return new CliConfigBuilder().toJS()
	})

	const _setState = React.useCallback((fn: (draft: Draft<State>) => any) => {
		setState(produce(fn))
		// Only refresh the config if they have chose to have a config
		if (fs.existsSync(configPath)) {
			fs.writeFileSync(configPath, yaml.stringify(state))
		}
	}, [])

	const _createAddExtDir = React.useCallback((ext: 'json' | 'yml') => {
		return (dir: string | string[]) => {
			const dirs = Array.isArray(dir) ? dir : [dir]
			_setState((draft) => {
				dirs.forEach((d) => {
					if (!draft.objects[ext].dir.includes(d)) {
						draft.objects[ext].dir.push(d)
					}
				})
			})
		}
	}, [])

	const addJsonDir = React.useMemo(() => _createAddExtDir('json'), [])
	const addYmlDir = React.useMemo(() => _createAddExtDir('yml'), [])

	const setServerConfig = React.useCallback(
		(config: string) =>
			_setState((draft) => void (draft.server.config = config)),
		[],
	)

	const setServerDir = React.useCallback(
		(dir: string) => _setState((draft) => void (draft.server.dir = dir)),
		[],
	)

	return {
		...state,
		addJsonDir,
		addYmlDir,
		setServerConfig,
		setServerDir,
	}
}

export default useCliConfig
