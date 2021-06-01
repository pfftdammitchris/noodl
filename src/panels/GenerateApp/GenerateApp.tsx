import * as u from '@jsmanifest/utils'
import React from 'react'
import yaml from 'yaml'
import fs from 'fs-extra'
import path from 'path'
import merge from 'lodash/merge'
import {
	RootConfig,
	RootConfigDeviceVersionObject,
	AppConfig,
	DeviceType,
	Env,
} from 'noodl-types'
import produce, { Draft } from 'immer'
import { Spacer } from 'ink'
import { UncontrolledTextInput } from 'ink-text-input'
import Panel from '../../components/Panel'
import useCtx from '../../useCtx'
import {
	RETRIEVED_ROOT_CONFIG,
	RETRIEVING_APP_CONFIG,
	PARSED_APP_CONFIG,
	RETRIEVED_APP_PAGE,
} from '../../api/createAggregator'
import * as c from '../../constants'
import * as com from '../../utils/common'
import * as co from '../../utils/color'
import * as r from '../../utils/remote'
import * as t from './types'

export const initialState = {
	apiHost: '',
	apiPort: 443,
	configKey: '',
	deviceType: '' as RootConfigDeviceVersionObject | '',
	rootConfig: {} as RootConfig,
	appConfig: {} as AppConfig,
	assets: {
		html: [],
		js: [],
		images: [],
		pdf: [],
		json: {},
		videos: [],
	},
}

function GetApp() {
	const { aggregator, cli, log, logError, settings } = useCtx()
	const [state, _setState] = React.useState(() => {
		const initState = {
			...initialState,
			deviceType: cli.flags.device,
		} as t.State
		cli.flags.config && (initState.configKey = cli.flags.config)
		return initState
	})

	const setState = React.useCallback(
		async (
			fn: ((draft: Draft<typeof initialState>) => void) | Partial<t.State>,
		) => {
			_setState(
				produce((draft) => {
					if (u.isFnc(fn)) fn(draft)
					else merge(draft, fn)
				}),
			)
		},
		[],
	)

	const saveFile = React.useCallback(
		async (
			filename: string,
			data: string | Record<string, any> | undefined,
		) => {
			try {
				// Treat it as yml
				if (u.isStr(data)) {
					await fs.writeFile(
						com.getAbsFilePath('server', filename),
						data,
						'utf8',
					)
				} else if (u.isObj(data)) {
					await fs.writeJson(com.getAbsFilePath('server', filename), data, {
						spaces: 2,
					})
				}
			} catch (error) {
				console.error(error)
			}
		},
		[],
	)

	const loadConfig = React.useCallback(async (configKey: string) => {
		if (configKey) {
			try {
				log(`\nLoading config ${co.yellow(`${configKey}`)}`)

				let yml = await r.getConfig(configKey)
				let configFileName = !configKey.endsWith('.yml')
					? `${configKey}.yml`
					: configKey

				saveFile(configFileName, yml)
				log(`Saved ${co.yellow(configFileName)} to folder`)

				aggregator.configKey = configKey
				aggregator.env = cli.flags.env as Env
				aggregator.deviceType = cli.flags.device as DeviceType
				aggregator.configVersion = cli.flags.version

				log(
					`Config version set to ${co.yellow(aggregator.configVersion)}${
						cli.flags.version === 'latest'
							? ` (using option "${co.yellow('latest')}")`
							: ''
					}`,
				)

				const dir = path.join(
					settings.get(c.GENERATE_DIR_KEY),
					aggregator.configKey,
				)
				const assetsDir = path.join(dir, 'assets')

				if (!fs.existsSync(dir)) {
					await fs.ensureDir(dir)
					log(`Created output directory: ${co.yellow(dir)}`)
				}

				if (!fs.existsSync(assetsDir)) {
					await fs.ensureDir(assetsDir)
					log(`Created assets in output directory: ${co.yellow(assetsDir)}`)
				}

				function createOnDoc(type: 'root-config' | 'app-config' | 'app-page') {
					async function onDoc({
						name,
						doc,
					}: {
						name: string
						doc: yaml.Document
					}) {
						const filename = com.withYmlExt(name).replace('_en', '')
						const filepath = path.join(dir, filename)
						if (!doc) return u.log(doc)
						await fs.writeFile(filepath, doc.toString(), 'utf8')
						if (type === 'root-config') {
							const baseUrl = doc.get('cadlBaseUrl')
							const appKey = doc.get('cadlMain')
							log(`Base url: ${co.yellow(baseUrl)}`)
							log(`App config url: ${co.yellow(`${baseUrl}${appKey}`)}`)
							setState({ configKey, rootConfig: doc.toJS() })
							log(`Saved root config object to ${co.yellow(filepath)}`)
						} else if (type === 'app-config') {
							setState({ appConfig: doc?.toJS() })
							log(`Saved app config to ${co.yellow(filepath)}`)
						} else {
							const pageName = name.replace('_en', '')
							log(
								`Saved page ${co.magenta(pageName)} to ${co.yellow(filepath)}`,
							)
						}
					}
					return onDoc
				}

				await aggregator
					.on(RETRIEVED_ROOT_CONFIG, createOnDoc('root-config'))
					.on(PARSED_APP_CONFIG, createOnDoc('app-config'))
					.on(RETRIEVED_APP_PAGE, createOnDoc('app-page'))
					.init({ loadPages: { includePreloadPages: true } })
			} catch (error) {
				logError(error)
			}
		}
	}, [])

	React.useEffect(() => {
		state.configKey && loadConfig(state.configKey)
	}, [])

	return (
		<Panel>
			<Spacer />
			{!state.configKey ? (
				<UncontrolledTextInput
					placeholder="Which config should we use?"
					onSubmit={loadConfig}
				/>
			) : null}
			<Spacer />
		</Panel>
	)
}

export default GetApp
