import * as u from '@jsmanifest/utils'
import React from 'react'
import fs from 'fs-extra'
import path from 'path'
import produce from 'immer'
import {
	RETRIEVED_APP_CONFIG,
	RETRIEVED_APP_OBJECT,
	RETRIEVED_ROOT_CONFIG,
} from '../api/createAggregator'
import useCtx from '../useCtx'
import * as co from '../utils/color'
import * as com from '../utils/common'

const initialState = {
	preloadPages: [],
	pages: [],
}

function useRetrieveAppConfig({ onError, onEnd }) {
	const [state, _setState] = React.useState(initialState)
	const { aggregator, log, logError, settings } = useCtx()

	const start = React.useCallback(async () => {
		let savedPageCount = 0

		async function onObject(
			args: {
				json: Record<string, any> | Record<string, any>[]
				yml: string
			} & { name: string },
		) {
			if (u.isObj(args)) {
				const { name, json, yml } = args
				const withExt = ext === 'json' ? withJsonExt : withYmlExt
				const saveFn = ext === 'json' ? saveJson : saveYml
				try {
					for (let dir of settings.objects[ext]?.dir || []) {
						dir = com.getAbsFilePath(dir)
						let filepath = withExt(path.join(dir, name))

						if (!fs.existsSync(dir)) {
							await fs.mkdirp(dir)
							log(`Created folder ${co.magenta(dir)}`)
						}

						saveFn(filepath)(ext === 'json' ? json : yml)
						log(`Saved ${co.yellow(`${name}.${ext}`)} to ${co.magenta(dir)}`)
					}
				} catch (error) {
					log(`[${co.red(`${name} - [${error.name}]`)}]: ${error.message}`)
				}
				savedPageCount++
			}
		}

		aggregator
			.on(
				RETRIEVED_ROOT_CONFIG,
				async ({ json, yml }: { json: Record<string, any>; yml: string }) => {
					await onObject({ name: state.config, json, yml })
				},
			)
			.on(RETRIEVED_APP_CONFIG, onObject)
			.on(RETRIEVED_APP_OBJECT, onObject)
			.init({
				version: 'latest',
				loadPages: { includePreloadPages: true },
			})
			.then(() => {
				log(`\nSaved ${co.yellow(String(savedPageCount))} objects`)
			})
			.catch((err) => {
				logError(err)
				onError?.(err)
			})
			.finally(() => {
				_setState((d) => void (d.status = 'idle'))
				onEnd?.()
			})
	}, [])
}

export default useRetrieveAppConfig
