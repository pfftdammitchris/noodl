import React from 'react'
import yaml from 'yaml'
import fs from 'fs-extra'
import path from 'path'
import { Box, BoxProps } from 'ink'
import { UncontrolledTextInput } from 'ink-text-input'
import produce, { Draft } from 'immer'
import globby from 'globby'
import createObjectScripts from '../api/createObjectScripts'
import {
	captioning,
	deepOrange,
	getFilePath,
	groupAssets,
	magenta,
	newline,
	red,
	saveYml,
	yellow,
	white,
	isImg,
	isJs,
	isPdf,
	isVid,
} from '../utils/common'
import scriptObjs, { id as scriptId } from '../utils/scripts'
import useCtx from '../useCtx'
import HighlightedText from '../components/HighlightedText'
import DownloadAsset, { DownloadAssetProps } from '../components/DownloadAsset'
import cliConfig from '../cliConfig'
import * as c from '../constants'
import * as ST from '../types/serverScriptTypes'
import * as T from '../types'
import { YAMLMap } from 'yaml/types'

const initialState: ST.State = {
	config: '',
	dataSource: '',
	dirFiles: [],
	step: c.serverScript.step.CONFIG,
	steps: [c.serverScript.step.CONFIG, c.serverScript.step.DOWNLOAD_ASSETS],
	stepContext: Object.values(c.serverScript.step).reduce(
		(acc, key) => Object.assign(acc, { [key]: {} }),
		{},
	),
} as ST.State

const reducer = produce(
	(draft: Draft<ST.State> = initialState, action: ST.Action): void => {
		switch (action.type) {
			case c.serverScript.action.SET_CONFIG:
				return void (draft.config = action.config)
			case c.serverScript.action.SET_STEP: {
				draft.step = action.step
				if (action.step === c.serverScript.step.DOWNLOAD_ASSETS) {
					draft.stepContext[c.serverScript.step.DOWNLOAD_ASSETS] = {
						...draft.stepContext[c.serverScript.step.DOWNLOAD_ASSETS],
						assets: action.assets,
					}
				} else {
					if (action.options) {
						Object.assign(
							draft.stepContext[action.step as Exclude<ST.State['step'], ''>],
							action.options,
						)
					}
				}
				break
			}
		}
	},
)

function StartServer() {
	const [state, dispatch] = React.useReducer(reducer, initialState)
	const { aggregator, setCaption, toggleSpinner } = useCtx()

	const getAssetsFolder = () => path.join(cliConfig.server.dir, 'assets')

	const onSetConfig = React.useCallback(async (config: string) => {
		// Search server dir for config file
		if (!config) return

		dispatch({ type: c.serverScript.action.SET_CONFIG, config })
		setCaption(`\nConfig set to ${magenta(config)}`)

		const serverFolder = getFilePath(cliConfig.server.dir)
		const assetsFolder = getAssetsFolder()
		const serverFolderExists = fs.existsSync(serverFolder)
		const assetsFolderExists = fs.existsSync(assetsFolder)

		// Not found
		if (!serverFolderExists) {
			fs.ensureDirSync(serverFolder)
			setCaption(`Created server folder at ${magenta(serverFolder)}`)
		}
		if (!assetsFolderExists) {
			fs.ensureDirSync(assetsFolder)
			setCaption(`Created assets folder at ${magenta(assetsFolder)}`)
		}

		// Found
		const configFiles = await globby(
			`${path.join(serverFolder, `**/*/${config}.yml`)}`,
		)

		if (!configFiles.length) {
			newline()
			setCaption(
				`\nNo config files were found for config ${magenta(
					config,
				)}. Retrieving remotely...\n`,
			)

			const onRetrievedObject = ({
				name,
				yml,
			}: T.ObjectResult & { name: string }) => {
				if (name === config) {
					const doc = yaml.parseDocument(yml)
					const contents = doc.contents as YAMLMap
					contents.set('cadlBaseUrl', 'http://127.0.0.1:3001/')
					contents.set('myBaseUrl', 'http://127.0.0.1:3001/')
					yml = yaml.stringify(contents)
				}
				const filename = name + '.yml'
				const filepath = getFilePath(cliConfig.server.dir, filename)
				setCaption(
					`Saved ${magenta(filename)} to ${getFilePath(cliConfig.server.dir)}`,
				)
				saveYml(filepath, yml)
			}

			const configObjs = await aggregator
				.on(c.aggregator.event.RETRIEVED_ROOT_CONFIG, onRetrievedObject)
				.on(c.aggregator.event.RETRIEVED_APP_CONFIG, onRetrievedObject)
				.on(c.aggregator.event.RETRIEVED_APP_OBJECT, onRetrievedObject)
				.setConfigId(config)
				.setHost(cliConfig.objects.hostname)
				.init({ loadPages: true })

			const rootConfig = configObjs[0]
			const appConfig = configObjs[1]

			setCaption(
				`\nVersion is set to latest web (${yellow('TEST')}) (${magenta(
					rootConfig.web?.cadlVersion?.test,
				)})\n`,
			)

			rootConfig.cadlBaseUrl &&
				setCaption(`cadlBaseUrl: ${magenta(rootConfig.cadlBaseUrl)}`)
			rootConfig.cadlMain &&
				setCaption(`cadlMain: ${magenta(rootConfig.cadlMain)}`)
			rootConfig.cadlBaseUrl &&
				setCaption(`myBaseUrl: ${magenta(rootConfig.cadlBaseUrl)}\n`)

			appConfig.preload &&
				setCaption(
					`${yellow(appConfig.preload.length)} preload page objects found`,
				)
			appConfig.page &&
				setCaption(`${yellow(appConfig.page.length)} pages objects found`)
		} else {
			setCaption(
				`Found ${magenta(configFiles.length)} files with ${magenta(
					config,
				)}.\nWould you like to load from this config?`,
			)
		}

		setCaption(captioning('\nChecking for missing assets...\n'))
		setStep(c.serverScript.step.SCAN_ASSETS)
	}, [])

	const setStep = React.useCallback(
		(step: ST.State['step'], stepContext?: any) => {
			dispatch({
				type: c.serverScript.action.SET_STEP,
				step,
				...stepContext,
			})
			console.log(`${deepOrange('STEP')}: ` + magenta(step || '<none>'))
		},
		[],
	)

	React.useEffect(() => {
		setCaption(`${deepOrange('STEP')}: ${magenta(state?.step)}\n`)
		setCaption(`Server dir: ${magenta(getFilePath(cliConfig.server.dir))}`)
		setCaption(`Server host: ${magenta(cliConfig.server.host)}`)
		setCaption(`Server port: ${magenta(cliConfig.server.port)}`)
	}, [])

	React.useEffect(() => {
		if (state?.step === c.serverScript.step.SCAN_ASSETS) {
			const docNameMapper = new Map<yaml.Document, string>()
			const ymlDocs = Object.entries(aggregator.get('yml')).reduce(
				(acc, [name, yml]) => {
					const doc = yaml.parseDocument(yml)
					docNameMapper.set(doc, name)
					return acc.concat(doc)
				},
				[] as yaml.Document[],
			)
			const scripts = createObjectScripts()
			scripts.data(ymlDocs)
			scripts
				.use(scriptObjs[scriptId.RETRIEVE_URLS])
				.on('start', (store) => {
					if (!store.urls) store.urls = []
				})
				.on('end', (store) => {
					store.urls = store.urls.sort()
					const assets = groupAssets(store.urls)
					const { images, other, pdfs, videos } = assets
					newline()
					setCaption(`Found ${magenta(images.length)} image assets`)
					setCaption(`Found ${magenta(pdfs.length)} pdf assets`)
					setCaption(`Found ${magenta(videos.length)} video assets`)
					setCaption(`Found ${magenta(other.length)} other assets`)
					setCaption(
						`\n${magenta(store.urls.length)} overall assets in config ${magenta(
							state?.config,
						)}\n`,
					)
					const rootConfig = aggregator.get(state.config)
					const myBaseUrl = rootConfig?.myBaseUrl || ''
					const dirAssets = fs.readdirSync(getAssetsFolder())
					const [existentAssets, missingAssets] = store.urls.reduce(
						(acc: [string[], string[]], asset = '') => {
							if (asset.startsWith('http') && !/aitmed/i.test(asset)) {
								return acc
							}
							if (asset.includes('~/') && myBaseUrl) {
								if (asset.startsWith('~/')) {
									asset = asset.replace('~/', myBaseUrl)
								} else {
									asset = myBaseUrl + asset.substring(asset.indexOf('~/') + 2)
								}
							}
							const pathname = asset.substring(asset.lastIndexOf('/') + 1)
							if (dirAssets.includes(encodeURIComponent(pathname))) {
								acc[0].push(asset)
							} else {
								acc[1].push(asset)
							}
							return acc
						},
						[[], []],
					)
					setCaption(
						`You have ${yellow(existentAssets.length)} of ${yellow(
							store.urls.length,
						)} assets`,
					)
					setCaption(
						captioning(
							`\nDownloading ${yellow(
								missingAssets.length,
							)} missing assets...\n`,
						),
					)

					setStep(c.serverScript.step.DOWNLOAD_ASSETS, {
						assets: missingAssets,
					})
					toggleSpinner()
					import('../server')
				})
				.run()
		}
	}, [state?.step])

	const getAssetType = (url: string) => {
		if (isImg(url)) return 'image'
		else if (isVid(url)) return 'video'
		else if (isPdf(url)) return 'pdf'
		else if (isJs(url)) return 'javascript'
		else if (url.endsWith('.html')) return 'html'
		else if (url.endsWith('.yml')) return 'yaml'
		else if (url.endsWith('.json')) return 'json'
		else return ''
	}

	const onDownloadStart = React.useCallback(async ({ link }: // @ts-expect-error
	Parameters<DownloadAssetProps['onDownload']>[0]) => {
		setCaption(`Downloading ${yellow(getAssetType(link))}: ${magenta(link)}`)
	}, [])

	const onDownloadError = React.useCallback(
		// @ts-expect-error
		async ({ error, asset }: Parameters<DownloadAssetProps['onError']>[0]) => {
			setCaption(`[${red(error.name)}]: ${yellow(error.message)} (${asset})`)
		},
		[],
	)

	const Container = React.memo(
		({
			children,
			label,
			...rest
		}: React.PropsWithChildren<BoxProps> & { label?: string }) => (
			<Box flexDirection="column" {...rest}>
				{label ? <HighlightedText>{label}</HighlightedText> : null}
				{children}
			</Box>
		),
	)

	const currentStep = state?.step || ''
	const assetsDir = getAssetsFolder()

	switch (currentStep) {
		case c.serverScript.step.CONFIG:
			return (
				<Container label="Which config should we use?">
					<UncontrolledTextInput
						onSubmit={onSetConfig}
						placeholder={`Enter the config here ${white('(example: meet2d)')}`}
					/>
				</Container>
			)
		case c.serverScript.step.DOWNLOAD_ASSETS:
			return (
				<DownloadAsset
					urls={
						state?.stepContext[c.serverScript.step.DOWNLOAD_ASSETS]
							?.assets as string[]
					}
					to={assetsDir}
					onDownload={onDownloadStart}
					onError={onDownloadError}
				/>
			)
	}

	return null
}

export default StartServer
