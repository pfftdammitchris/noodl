import React from 'react'
import produce, { Draft } from 'immer'
import fs from 'fs-extra'
import path from 'path'
import yaml from 'yaml'
import * as u from '@jsmanifest/utils'
import omit from 'lodash/omit'
import { BoxProps } from 'ink'
import { UncontrolledTextInput } from 'ink-text-input'
import { Provider } from './useServerFilesCtx'
import RootConfigBuilder from '../../builders/RootConfig'
import Panel from '../../components/Panel'
import Spinner from '../../components/Spinner'
import ScanAssets from './ScanAssets'
import DownloadAssets, { DownloadAssetsProps } from './DownloadAssets'
import useCtx from '../../useCtx'
import {
	aggregator as aggregatorConst,
	DEFAULT_CONFIG_HOSTNAME,
} from '../../constants'
import { Noodl } from '../../types'
import * as com from '../../utils/common'
import * as co from '../../utils/color'
import * as c from './constants'
import * as t from './types'

export interface GetServerFilesProps {
	onDownloadedAssets?: DownloadAssetsProps['onEnd']
}

function createInitialGroupedFiles(): t.GetServerFiles.GroupedFiles {
	return u.reduce(
		u.keys(com.createGroupedMetadataObjects()),
		(acc, group) => u.assign(acc, { [group]: {} }),
		{} as t.GetServerFiles.GroupedFiles,
	)
}

export const initialState = {
	activeStep: c.step.INITIALIZING as t.GetServerFiles.Step,
	filesContained: createInitialGroupedFiles(),
	filesMissing: createInitialGroupedFiles(),
	step: {
		initializing: c.step.INITIALIZING,
		promptConfig: c.step.PROMPT_CONFIG,
		loadFiles: c.step.LOAD_FILES,
		scanAssets: c.step.SCAN_ASSETS,
		downloadAssets: c.step.DOWNLOAD_ASSETS,
		runServer: c.step.RUN_SERVER,
	},
}

function GetServerFiles(props: GetServerFilesProps) {
	const [state, _setState] = React.useState(initialState)
	const { aggregator, cli, settings, log, spinner, toggleSpinner } = useCtx()

	const setState = React.useCallback(
		(fn: (draft: Draft<t.GetServerFiles.State>) => void) =>
			_setState(produce(fn)),
		[],
	)

	const ctx: t.GetServerFiles.Context = {
		...state,
		setOn: (opts: any) => setState((d) => void u.assign(d, opts)),
		consumeMissingFiles: () => {
			setState((d) => void (d.filesMissing = createInitialGroupedFiles()))
		},
		insertMissingFiles: (files) =>
			setState((draft) => {
				files.forEach(({ group, raw }, index) => {
					if (
						!draft.filesContained[group][raw] &&
						!draft.filesMissing[group][raw]
					) {
						u.assign(draft.filesMissing[group], {
							[raw]: {
								...files[index],
								status: c.file.status.PENDING,
							},
						})
					}
				})
			}),
		setStep: (step: t.GetServerFiles.Step) =>
			setState((d) => void (d.activeStep = step)),
	}

	const runConfig = React.useCallback(
		async (config: string) => {
			log(co.captioning(`\nRunning ${u.italic(config)} config...`))

			if (!spinner) toggleSpinner()
			if (state.step) ctx.setStep('')

			const serverDir = settings.server.dir
			const assetsDir = path.join(serverDir, 'assets')
			const configPath = path.join(serverDir, `${config}.yml`)

			if (aggregator.config !== config) aggregator.config = config
			if (settings.server.config !== config)
				settings.set((d) => void (d.server.config = config))

			if (!fs.existsSync(serverDir)) {
				fs.ensureDirSync(serverDir)
				log(`Created server dir at ${u.magenta(serverDir)}`)
			}

			if (!fs.existsSync(assetsDir)) {
				fs.ensureDirSync(path.join(serverDir, 'assets'))
				log(`Created assets dir at ${u.magenta(assetsDir)}`)
			}

			if (!fs.existsSync(configPath)) {
				log(
					`\nMissing config file in your server dir. Fetching ${u.magenta(
						config,
					)} config from remote now\n`,
				)
				const url = `https://${DEFAULT_CONFIG_HOSTNAME}/config/${config}.yml`
				log(`Remote config url: ${u.magenta(url)}`)
				await aggregator.init()
				fs.writeFileSync(configPath, aggregator.builder.rootConfig.yml, 'utf8')
				log(
					`Saved config as ${u.yellow(`${config}.yml`)} to ${u.magenta(
						configPath,
					)}\n`,
				)
			} else {
				// TODO - Load config from dir, use that as the single source of truth
				await aggregator.init()
				const rootConfigYml = fs.readFileSync(configPath, 'utf8')
				const rootConfigJson = RootConfigBuilder.parsePlaceholders(
					yaml.parse(rootConfigYml) as Noodl.RootConfig,
				)
				aggregator.builder.rootConfig.json = rootConfigJson
				aggregator.builder.rootConfig.yml = rootConfigYml
				aggregator.builder.appConfig.rootConfig = rootConfigJson
				aggregator.set('yml', config, rootConfigYml)
				aggregator.set('json', config, rootConfigJson)
				log(`Loaded config file from ${u.magenta(configPath)}\n`)
			}

			const rootConfig = aggregator.builder.rootConfig.json as Noodl.RootConfig
			const appConfig = aggregator.builder.appConfig.json as Noodl.AppConfig

			rootConfig.cadlBaseUrl &&
				log(`${u.italic('cadlBaseUrl')}: ${u.magenta(rootConfig.cadlBaseUrl)}`)
			rootConfig.cadlBaseUrl &&
				log(`${u.italic('myBaseUrl')}: ${u.magenta(rootConfig.cadlBaseUrl)}`)
			rootConfig.cadlMain &&
				log(`${u.italic('cadlMain')}: ${u.magenta(rootConfig.cadlMain)}\n`)
			appConfig.preload &&
				log(
					`${u.yellow(
						String(appConfig.preload.length),
					)} preload page objects in total`,
				)
			appConfig.page &&
				log(
					`${u.yellow(String(appConfig.page.length))} pages objects in total\n`,
				)

			const onRetrievedObject = ({
				name,
				yml,
			}: { json: Record<string, any> | Record<string, any>[]; yml: string } & {
				name: string
			}) => {
				if (name === config) {
					const doc = yaml.parseDocument(yml)
					const contents = doc.contents as yaml.YAMLMap
					const baseUrl = 'http://127.0.0.1:3001/'
					contents.set('cadlBaseUrl', baseUrl)
					contents.set('myBaseUrl', baseUrl)
					yml = yaml.stringify(contents)
					log(
						`${u.yellow('cadlBaseUrl')} and ${u.yellow(
							'myBaseUrl',
						)} was set to ${u.magenta(baseUrl)}`,
					)
					const filepath = path.join(settings.server.dir, config + '.yml')
					com.saveYml(filepath, yml)
					log(
						`Loaded and saved ${u.white(config + '.yml')} to ${u.magenta(
							settings.server.dir,
						)}\n`,
					)
				} else if (name === 'cadlEndpoint') {
					const homePageUrlId = '~/HomePageUrl'
					const doc = yaml.parseDocument(yml)
					const contents = doc.contents as yaml.YAMLMap
					const preloadPages = contents.get('preload') as yaml.YAMLSeq
					const js = preloadPages.toJSON()
					if (js.includes(homePageUrlId)) {
						js.splice(js.indexOf(homePageUrlId), 1)
					}
					contents.set('preload', js)
					yml = yaml.stringify(contents)
					const filepath = path.join(settings.server.dir, name + '.yml')
					com.saveYml(filepath, yml)
					log(
						`Loaded and saved ${u.white('cadlEndpoint.yml')} to ${u.magenta(
							filepath,
						)}`,
					)
				} else {
					const filename = name + '.yml'
					const filepath = path.join(settings.server.dir, filename)
					com.saveYml(filepath, yml)
					log(`Saved ${u.white(filename)} to ${u.magenta(filepath)}`)
				}
			}

			// Load up the contents of the app config
			await aggregator
				.on(aggregatorConst.event.RETRIEVED_ROOT_CONFIG, onRetrievedObject)
				.on(aggregatorConst.event.RETRIEVED_APP_CONFIG, onRetrievedObject)
				.on(aggregatorConst.event.RETRIEVED_APP_OBJECT, onRetrievedObject)
				.init({ loadPages: { includePreloadPages: true } })

			ctx.setStep(c.step.SCAN_ASSETS)

			u.newline()
		},
		[aggregator, settings, spinner],
	)

	React.useEffect(() => {
		log(`\n${co.deepOrange('STEP')}: ${u.magenta(String(state.activeStep))}\n`)
		log(`Server dir: ${u.magenta(com.getAbsFilePath(settings.server.dir))}`)
		log(`Server host: ${u.magenta(settings.server.host)}`)
		log(`Server port: ${u.magenta(String(settings.server.port))}`)
	}, [])

	React.useEffect(() => {
		if (!cli.flags.config) ctx.setStep(c.step.PROMPT_CONFIG)
		else runConfig(cli.flags.config)
	}, [])

	const Container = React.memo(
		(props: React.PropsWithChildren<BoxProps> & { label?: string }) => (
			<Panel header={props.label} {...omit(props, ['children', 'label'])}>
				{props.children}
			</Panel>
		),
	)

	let component: React.ReactNode

	if (state.activeStep === c.step.INITIALIZING) {
		component = <Spinner />
	} else if (state.activeStep === c.step.PROMPT_CONFIG) {
		component = (
			<Container label="Which config should we use?">
				<UncontrolledTextInput
					onSubmit={runConfig}
					placeholder={`Enter the config here ${u.white(
						`(example: ${u.magenta('meet2d')})`,
					)}`}
				/>
			</Container>
		)
	} else if (state.activeStep === c.step.SCAN_ASSETS) {
		component = <ScanAssets />
	} else if (state.activeStep === c.step.DOWNLOAD_ASSETS) {
		component = <DownloadAssets onEnd={props.onDownloadedAssets} />
	} else {
		component = null
	}

	return <Provider value={ctx}>{component}</Provider>
}

export default GetServerFiles
