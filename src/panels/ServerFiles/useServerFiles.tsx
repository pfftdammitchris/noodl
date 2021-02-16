import React from 'react'
import { YAMLMap, YAMLSeq } from 'yaml/types'
import fs from 'fs-extra'
import path from 'path'
import yaml from 'yaml'
import produce from 'immer'
import useCtx from '../../useCtx'
import RootConfigBuilder from '../../builders/RootConfig'
import { AppConfig, RootConfig, ObjectResult } from '../../types'
import { createInitialGroupedFiles } from './helpers'
import {
	aggregator as aggregatorConst,
	DEFAULT_CONFIG_HOSTNAME,
} from '../../constants'
import * as u from '../../utils/common'
import * as c from './constants'
import * as T from './types'

/**
 * PART 1
 * 		1. Set config
 * 		2. Find in serverDir
 * 			2a. Found
 * 				3. Load root config to aggregator
 * 			2b. Not found
 * 				3. Fetch remote, load root config to aggregator
 * PART 2
 * 		1. Load app config
 * 		2. Load preload page objects
 * 		3. Load page objects
 * PART 3
 * 		1. Download missing assets (images, videos, etc)
 */

const initialState: T.ServerFilesState = {
	files: {
		contained: createInitialGroupedFiles(),
		missing: createInitialGroupedFiles(),
	},
	step: c.step.INITIALIZING,
}

function reducer(
	state: T.ServerFilesState = initialState,
	action: T.ServerFilesAction,
): T.ServerFilesState {
	return produce(state, (draft) => {
		switch (action.type) {
			case c.action.CONSUME_MISSING_FILES:
				return void (draft.files.missing = createInitialGroupedFiles())
			case c.action.INSERT_MISSING_FILES: {
				for (const metadata of action.files) {
					const group = metadata.group
					if (
						!draft.files.contained[group][metadata.raw] &&
						!draft.files.missing[group][metadata.raw]
					) {
						Object.assign(draft.files.missing[group], {
							[metadata.raw]: {
								...metadata,
								status: c.file.status.PENDING,
							},
						})
					}
				}
				break
			}
			case c.action.SET_FILE_STATUS: {
				const { group, raw, status } = action
				const { contained, missing } = draft.files

				let files:
					| T.ServerFilesGroupedFiles[keyof T.ServerFilesGroupedFiles]
					| undefined

				if (contained[group]?.[raw]) files = contained[group]
				else if (missing[group]?.[raw]) files = missing[group]

				if (files) {
					files[raw].status = status
					// Move it to the contained state after we are done processing it
					if (status === c.file.status.DOWNLOADED) {
						const file = files[raw]
						delete files[raw]
						contained[group][raw] = file
					}
				}
				break
			}
			case c.action.SET_STEP:
				return void (draft.step = action.step)
		}
	})
}

function useServerFiles() {
	const [state, dispatch] = React.useReducer(reducer, initialState)
	const { aggregator, cliConfig, setCaption, spinner, toggleSpinner } = useCtx()

	const setFileStatus = React.useCallback(
		async (args: Pick<T.ServerFilesFile, 'group' | 'raw' | 'status'>) =>
			dispatch({ type: c.action.SET_FILE_STATUS, ...args }),
		[],
	)

	const consumeMissingFiles = React.useCallback(() => {
		const missingFiles = state.files.missing
		dispatch({ type: c.action.CONSUME_MISSING_FILES })
		return missingFiles
	}, [state])

	const insertMissingFiles = React.useCallback(
		(files: T.MetadataObject[]) =>
			dispatch({ type: c.action.INSERT_MISSING_FILES, files }),
		[],
	)

	const setStep = React.useCallback(
		(step: T.ServerFilesState['step'], stepContext?: any) => {
			dispatch({ type: c.action.SET_STEP, step, ...stepContext })
			setCaption(`\n${u.deepOrange('STEP')}: ${u.magenta(step || '<none>')}\n`)
		},
		[],
	)

	const runConfig = React.useCallback(
		async (config: string) => {
			setCaption(u.captioning(`\nRunning ${u.italic(config)} config...`))

			if (!spinner) toggleSpinner()
			if (state.step) setStep('')

			const serverDir = cliConfig.server.dir
			const assetsDir = path.join(serverDir, 'assets')
			const configPath = path.join(serverDir, `${config}.yml`)

			if (aggregator.config !== config) aggregator.config = config
			if (cliConfig.server.config !== config) cliConfig.setServerConfig(config)

			if (!fs.existsSync(serverDir)) {
				fs.ensureDirSync(serverDir)
				setCaption(`Created server dir at ${u.magenta(serverDir)}`)
			}

			if (!fs.existsSync(assetsDir)) {
				fs.ensureDirSync(path.join(serverDir, 'assets'))
				setCaption(`Created assets dir at ${u.magenta(assetsDir)}`)
			}

			if (!fs.existsSync(configPath)) {
				setCaption(
					`\nMissing config file in your server dir. Fetching ${u.magenta(
						config,
					)} config from remote now\n`,
				)
				const url = `https://${DEFAULT_CONFIG_HOSTNAME}/config/${config}.yml`
				setCaption(`Remote config url: ${u.magenta(url)}`)
				await aggregator.init()
				fs.writeFileSync(configPath, aggregator.builder.rootConfig.yml, 'utf8')
				setCaption(
					`Saved config as ${u.yellow(`${config}.yml`)} to ${u.magenta(
						configPath,
					)}\n`,
				)
			} else {
				// TODO - Load config from dir, use that as the single source of truth
				await aggregator.init()
				const rootConfigYml = fs.readFileSync(configPath, 'utf8')
				const rootConfigJson = RootConfigBuilder.parsePlaceholders(
					yaml.parse(rootConfigYml) as RootConfig,
				)
				aggregator.builder.rootConfig.json = rootConfigJson
				aggregator.builder.rootConfig.yml = rootConfigYml
				aggregator.builder.appConfig.rootConfig = rootConfigJson
				aggregator.set('yml', config, rootConfigYml)
				aggregator.set('json', config, rootConfigJson)
				setCaption(`Loaded config file from ${u.magenta(configPath)}\n`)
			}

			const rootConfig = aggregator.builder.rootConfig.json as RootConfig
			const appConfig = aggregator.builder.appConfig.json as AppConfig

			rootConfig.cadlBaseUrl &&
				setCaption(
					`${u.italic('cadlBaseUrl')}: ${u.magenta(rootConfig.cadlBaseUrl)}`,
				)
			rootConfig.cadlBaseUrl &&
				setCaption(
					`${u.italic('myBaseUrl')}: ${u.magenta(rootConfig.cadlBaseUrl)}`,
				)
			rootConfig.cadlMain &&
				setCaption(
					`${u.italic('cadlMain')}: ${u.magenta(rootConfig.cadlMain)}\n`,
				)
			appConfig.preload &&
				setCaption(
					`${u.yellow(appConfig.preload.length)} preload page objects in total`,
				)
			appConfig.page &&
				setCaption(
					`${u.yellow(appConfig.page.length)} pages objects in total\n`,
				)

			const onRetrievedObject = ({
				name,
				yml,
			}: ObjectResult & { name: string }) => {
				if (name === config) {
					const doc = yaml.parseDocument(yml)
					const contents = doc.contents as YAMLMap
					const baseUrl = 'http://127.0.0.1:3001/'
					contents.set('cadlBaseUrl', baseUrl)
					contents.set('myBaseUrl', baseUrl)
					yml = yaml.stringify(contents)
					setCaption(
						`${u.yellow('cadlBaseUrl')} and ${u.yellow(
							'myBaseUrl',
						)} was set to ${u.magenta(baseUrl)}`,
					)
					const filepath = path.join(cliConfig.server.dir, config + '.yml')
					u.saveYml(filepath, yml)
					setCaption(
						`Loaded and saved ${u.white(config + '.yml')} to ${u.magenta(
							cliConfig.server.dir,
						)}\n`,
					)
				} else if (name === 'cadlEndpoint') {
					const homePageUrlId = '~/HomePageUrl'
					const doc = yaml.parseDocument(yml)
					const contents = doc.contents as YAMLMap
					const preloadPages = contents.get('preload') as YAMLSeq
					const js = preloadPages.toJSON()
					if (js.includes(homePageUrlId)) {
						js.splice(js.indexOf(homePageUrlId), 1)
					}
					contents.set('preload', js)
					yml = yaml.stringify(contents)
					const filepath = path.join(cliConfig.server.dir, name + '.yml')
					u.saveYml(filepath, yml)
					setCaption(
						`Loaded and saved ${u.white('cadlEndpoint.yml')} to ${u.magenta(
							filepath,
						)}`,
					)
				} else {
					const filename = name + '.yml'
					const filepath = path.join(cliConfig.server.dir, filename)
					u.saveYml(filepath, yml)
					setCaption(`Saved ${u.white(filename)} to ${u.magenta(filepath)}`)
				}
			}

			// Load up the contents of the app config
			await aggregator
				.on(aggregatorConst.event.RETRIEVED_ROOT_CONFIG, onRetrievedObject)
				.on(aggregatorConst.event.RETRIEVED_APP_CONFIG, onRetrievedObject)
				.on(aggregatorConst.event.RETRIEVED_APP_OBJECT, onRetrievedObject)
				.init({ loadPages: { includePreloadPages: true } })

			setStep(c.step.SCAN_ASSETS)

			u.newline()
		},
		[aggregator, cliConfig],
	)

	React.useEffect(() => {
		setCaption(`${u.deepOrange('STEP')}: ${u.magenta(state.step)}\n`)
		setCaption(`Server dir: ${u.magenta(u.getFilepath(cliConfig.server.dir))}`)
		setCaption(`Server host: ${u.magenta(cliConfig.server.host)}`)
		setCaption(`Server port: ${u.magenta(cliConfig.server.port)}`)
	}, [])

	React.useEffect(() => {
		if (!cliConfig.server.config) setStep(c.step.PROMPT_CONFIG)
		else runConfig(cliConfig.server.config)
	}, [])

	return {
		...state,
		consumeMissingFiles,
		runConfig,
		insertMissingFiles,
		setFileStatus,
		setStep,
	}
}

export default useServerFiles
