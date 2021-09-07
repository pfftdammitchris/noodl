import * as u from '@jsmanifest/utils'
import React from 'react'
import merge from 'lodash/merge.js'
import { AppConfig, RootConfig } from 'noodl-types'
import { Draft, produce } from 'immer'
import useCtx from '../useCtx.js'

export interface Options {
	dir?: string
}

const initialState = {
	rootConfig: {
		remote: null as null | boolean,
		loading: false,
		loaded: false,
	},
	appConfig: {
		loading: false,
		loaded: false,
	},
}

function useConfigLoader({ dir: dirProp = '' }: Options = {}) {
	const [state, _setState] = React.useState(initialState)
	const { aggregator, log } = useCtx()

	const setState = React.useCallback(
		(
			fn:
				| Partial<typeof initialState>
				| ((draft: Draft<typeof initialState>) => void),
		) => {
			_setState(
				produce((draft) => {
					if (typeof fn === 'object') merge(draft, fn)
					else fn(draft)
				}),
			)
		},
		[],
	)

	const load = React.useCallback(
		async (
			opts: string | { configKey?: string; configObject?: RootConfig },
		) => {
			try {
				let configKey = ''
				let configObject: RootConfig

				if (u.isStr(opts)) {
					configKey = opts
				} else {
					configKey = opts.configKey as string
					configObject = opts.configObject as RootConfig
				}
			} catch (error) {
				console.error(error)
			}
		},
		[dirProp],
	)

	React.useEffect(() => {
		//
	}, [])

	return {
		...state,
	}
}

export default useConfigLoader
