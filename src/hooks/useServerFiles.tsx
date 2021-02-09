import React from 'react'
import { YAMLMap, YAMLSeq } from 'yaml/types'
import fs from 'fs-extra'
import path from 'path'
import yaml from 'yaml'
import produce from 'immer'
import globby from 'globby'
import useCtx from '../useCtx'
import cliConfig from '../cliConfig'
import { DEFAULT_CONFIG_HOSTNAME } from '../constants'
import * as u from '../utils/common'
import * as c from '../constants'
import * as T from '../types'

const log = console.log

export interface MetadataObject {
	assetType: 'html' | 'image' | 'js' | 'pdf' | 'video' | 'yml'
	ext?: string
	filepath?: any
	pathname: string
}

export type Action =
	| {
			type: typeof c.serverScript.action.SET_ASSET_METADATA_OBJECTS
			assets: MetadataObject[]
	  }
	| {
			type: typeof c.serverScript.action.SET_YML_METADATA_OBJECTS
			yml: MetadataObject[]
	  }

export interface State {
	configId: string
	assets: MetadataObject[]
	yml: MetadataObject[]
}

const initialState: State = {
	configId: '',
	assets: [],
	yml: [],
}

function reducer(state: State, action: Action) {
	return produce(state, (draft = initialState): void => {
		switch (action.type) {
			case c.serverScript.action.SET_ASSET_METADATA_OBJECTS:
				return void (draft.assets = action.assets)
			case c.serverScript.action.SET_YML_METADATA_OBJECTS:
				return void (draft.yml = action.yml)
		}
	})
}

function useServerFiles() {
	const [state, dispatch] = React.useReducer(reducer, initialState)
	const { aggregator, setCaption } = useCtx()

	const setStep = React.useCallback(
		(step: ST.State['step'], stepContext?: any) => {
			dispatch({ type: c.serverScript.action.SET_STEP, step, ...stepContext })
			console.log(`${u.deepOrange('STEP')}: ` + u.magenta(step || '<none>'))
		},
		[],
	)

	const _onConfigId = React.useCallback(async (configId: string) => {
		cliConfig.server.config = configId
		setCaption(`\nConfig set to ${u.magenta(configId)}`)

		const serverFolder = u.getFilePath(cliConfig.server.dir)
		const assetsFolder = getAssetsFolder()
		const serverFolderExists = fs.existsSync(serverFolder)
		const assetsFolderExists = fs.existsSync(assetsFolder)

		// Not found
		if (!serverFolderExists) {
			fs.ensureDirSync(serverFolder)
			setCaption(`Created server folder at ${u.magenta(serverFolder)}`)
		}
		if (!assetsFolderExists) {
			fs.ensureDirSync(assetsFolder)
			setCaption(`Created assets folder at ${u.magenta(assetsFolder)}`)
		}

		// Found
		const configFiles = await globby(
			`${path.join(serverFolder, `**/*/${state.configId}.yml`)}`,
		)

		if (!configFiles.length) {
			u.newline()
			setCaption(
				`\nNo config files were found for config ${u.magenta(
					configId,
				)}. Retrieving remotely...\n`,
			)

			const onRetrievedObject = ({
				name,
				yml,
			}: T.ObjectResult & { name: string }) => {
				if (name === configId) {
					const doc = yaml.parseDocument(yml)
					const contents = doc.contents as YAMLMap
					contents.set('cadlBaseUrl', 'http://127.0.0.1:3001/')
					contents.set('myBaseUrl', 'http://127.0.0.1:3001/')
					yml = yaml.stringify(contents)
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
				}
				const filename = name + '.yml'
				const filepath = u.getFilePath(cliConfig.server.dir, filename)
				setCaption(
					`Saved ${u.magenta(filename)} to ${u.getFilePath(
						cliConfig.server.dir,
					)}`,
				)
				u.saveYml(filepath, yml)
			}

			const configObjs = await aggregator
				.on(c.aggregator.event.RETRIEVED_ROOT_CONFIG, onRetrievedObject)
				.on(c.aggregator.event.RETRIEVED_APP_CONFIG, onRetrievedObject)
				.on(c.aggregator.event.RETRIEVED_APP_OBJECT, onRetrievedObject)
				.setConfigId(configId)
				.setHost(cliConfig.objects.hostname)
				.init({ loadPages: true })

			const rootConfig = configObjs[0]
			const appConfig = configObjs[1]

			setCaption(
				`\nVersion is set to latest web (${u.yellow('TEST')}) (${u.magenta(
					rootConfig.web?.cadlVersion?.test,
				)})\n`,
			)

			rootConfig.cadlBaseUrl &&
				setCaption(`cadlBaseUrl: ${u.magenta(rootConfig.cadlBaseUrl)}`)
			rootConfig.cadlMain &&
				setCaption(`cadlMain: ${u.magenta(rootConfig.cadlMain)}`)
			rootConfig.cadlBaseUrl &&
				setCaption(`myBaseUrl: ${u.magenta(rootConfig.cadlBaseUrl)}\n`)

			appConfig.preload &&
				setCaption(
					`${u.yellow(appConfig.preload.length)} preload page objects found`,
				)
			appConfig.page &&
				setCaption(`${u.yellow(appConfig.page.length)} pages objects found`)
		} else {
			setCaption(
				`Found ${u.magenta(configFiles.length)} files with ${u.magenta(
					configId,
				)}.\nWould you like to load from this config?`,
			)
		}

		setCaption(u.captioning('\nChecking for missing assets...\n'))
		setStep(c.serverScript.step.SCAN_ASSETS)
	}, [])

	const setConfigId = React.useCallback((configId: string) => {
		if (!configId) return
		aggregator.setConfigId(configId)
		_onConfigId(configId)
	}, [])

	const setServerDir = React.useCallback(
		(serverDir: string) => dispatch({ type: 'set.server.dir', serverDir }),
		[],
	)

	const getAssetsFolder = React.useCallback(
		() => path.join(serverDir, 'assets'),
		[],
	)

	React.useEffect(() => {
		log('')

		function createMetadataReducer(
			pred: (filestats: fs.Stats, filepath: string) => boolean,
		) {
			return (serverDir: string) => {
				return function metadataReducer(
					acc: MetadataObject[],
					filename: string,
				) {
					const filepath = path.join(serverDir, filename)
					const stat = fs.statSync(filepath)
					if (pred(stat, filepath))
						return acc.concat(getFilepathMetadata(filepath))
					return acc
				}
			}
		}

		function getFilepathMetadata(filepath: string): MetadataObject {
			let hasSlash = filepath.includes('/')
			let pathname = ''

			if (hasSlash) {
				pathname = filepath.substring(filepath.lastIndexOf('/'))
				if (pathname.includes('.'))
					pathname = pathname.substring(0, pathname.lastIndexOf('.'))
			} else {
				pathname = filepath
			}

			const result = {
				pathname,
			} as MetadataObject

			if (u.isYml(filepath)) {
				result.assetType = 'yml'
				result.ext = 'yml'
			} else if (u.isImg(filepath)) {
				result.assetType = 'image'
				result.ext = filepath
					.substring(filepath.lastIndexOf('.'))
					.replace('.', '')
			} else if (u.isPdf(filepath)) {
				result.assetType = 'pdf'
				result.ext = 'pdf'
			} else if (u.isVid(filepath)) {
				result.assetType = 'video'
				result.ext = filepath
					.substring(filepath.lastIndexOf('.'))
					.replace('.', '')
			} else if (u.isHtml(filepath)) {
				result.assetType = 'html'
				result.ext = 'html'
			} else if (u.isJs(filepath)) {
				result.assetType = 'js'
				result.ext = 'js'
			}

			if (result.assetType) result.filepath = filepath

			return result
		}

		async function init() {
			const config = state.configId
			const serverDir = cliConfig.server.dir
			const assetsDir = path.join(serverDir, 'assets')
			const configPath = path.join(serverDir, `${config}.yml`)

			if (!fs.existsSync(serverDir)) {
				fs.ensureDirSync(serverDir)
				log(`\nCreated server dir at ${u.magenta(serverDir)}`)
			}

			if (!fs.existsSync(assetsDir)) {
				fs.ensureDirSync(path.join(serverDir, 'assets'))
				log(`Created assets dir at ${u.magenta(assetsDir)}`)
			}

			if (!fs.existsSync(configPath)) {
				log(`Missing config file in your server dir. Fetching from remote now`)
				const url = `https://${DEFAULT_CONFIG_HOSTNAME}/config/${config}.yml`
				await aggregator.init()
				log(`Fetched config from: ${u.magenta(url)}\n`)
				fs.writeFileSync(
					configPath,
					aggregator.get('yml')[config] || '',
					'utf8',
				)
				log(`Saved ${u.yellow(config)}.yml to ${u.magenta(configPath)}\n`)
			} else {
				const configYml = fs.readFileSync(configPath, 'utf8')
				if (!aggregator.get('yml')[config]) {
					aggregator.set('yml', config, configYml)
				}
				if (!aggregator.get('json')[config]) {
					aggregator.set('json', config, yaml.parse(configYml))
				}
				aggregator.get()

				log(`Loaded config file found in the server dir\n`)
			}

			const createImageReducer = createMetadataReducer(
				(stat, filepath) => stat.isFile() && u.isImg(filepath),
			)
			const createYmlReducer = createMetadataReducer(
				(stat, filepath) => stat.isFile() && u.isYml(filepath),
			)

			const imgReducer = createImageReducer(assetsDir)
			const ymlReducer = createYmlReducer(serverDir)

			const ymlMetadataObjects = fs
				.readdirSync(serverDir, 'utf8')
				.reduce(ymlReducer, [] as MetadataObject[])

			const assetsMetadataObjects = fs
				.readdirSync(assetsDir)
				.reduce(imgReducer, [] as MetadataObject[])

			log(`Found ${u.magenta(ymlMetadataObjects.length)} yml files`)
			log(`Found ${u.magenta(assetsMetadataObjects.length)} asset files`)

			dispatch({
				type: 'set.asset.metadata.objects',
				assets: assetsMetadataObjects,
			})
			dispatch({ type: 'set.yml.metadata.objects', yml: ymlMetadataObjects })

			u.newline()
		}

		init()
	}, [])

	React.useEffect(() => {
		setCaption(`${u.deepOrange('STEP')}: ${u.magenta(state.step)}\n`)
		setCaption(`Server dir: ${u.magenta(u.getFilePath(cliConfig.server.dir))}`)
		setCaption(`Server host: ${u.magenta(cliConfig.server.host)}`)
		setCaption(`Server port: ${u.magenta(cliConfig.server.port)}`)
		if (cliConfig.server.config) setConfigId(cliConfig.server.config)
	}, [])

	return {
		...state,
		getAssetsFolder,
		setConfigId,
		setServerDir,
	}
}

export default useServerFiles
