import React from 'react'
import yaml from 'yaml'
import fs from 'fs-extra'
import path from 'path'
import useCtx from '../../useCtx'
import createObjectScripts from '../../api/createObjectScripts'
import scriptObjs, { id as scriptId, Store } from '../../utils/scripts'
import useServerFilesCtx from './useServerFilesCtx'
import { RootConfig, AppConfig } from '../../types'
import * as T from './types'
import * as u from '../../utils/common'
import * as c from './constants'

/**
 * This expects the serverDir to have been applyd with files either from a previous script
 * or manually. The aggregator should also have its rootConfig and appConfig loaded
 */
function ScanAssets() {
	const { aggregator, cliConfig, setCaption } = useCtx()
	const { insertMissingFiles, setStep } = useServerFilesCtx()

	React.useEffect(() => {
		const rootConfig = aggregator.builder.rootConfig.json as RootConfig
		const appConfig = aggregator.builder.appConfig.json as AppConfig
		const assetsDir = path.join(cliConfig.server.dir, 'assets')

		if (rootConfig && appConfig) {
			const myBaseUrl = rootConfig.myBaseUrl || ''
			const preloadPages = appConfig.preload
			const pages = appConfig.page
			const scripts = createObjectScripts()
			const ymlDocs = [...preloadPages, ...pages].reduce((acc, p) => {
				const filepath = u.getFilepath(cliConfig.server.dir, `${p}.yml`)
				if (fs.existsSync(filepath)) {
					return acc.concat(
						yaml.parseDocument(fs.readFileSync(filepath, 'utf8')),
					)
				} else {
					setCaption(`${u.red(p)} is not found`)
				}
				return acc
			}, [] as yaml.Document[])

			scripts.data(ymlDocs)
			scripts
				.use(scriptObjs[scriptId.RETRIEVE_URLS])
				.on('start', (store) => !store.urls && (store.urls = []))
				.on('end', (store: Store) => {
					store.urls = store.urls.sort()

					const contained = []
					const missing = []

					fs.ensureDirSync(assetsDir)

					const localAssetFiles = fs.readdirSync(assetsDir)
					// Meta data objects ƒetched remotely
					const groupedMetadataObjects = {
						...u.createGroupedMetadataObjects(),
						allUrls: [],
					} as T.GroupedMetadataObjects & { allUrls: string[] }

					const {
						documents,
						images,
						scripts,
						videos,
						allUrls,
					} = groupedMetadataObjects

					for (let url of store.urls) {
						const raw = url
						// Calculate and re-assign as the full url
						// Asset urls that are dependent on the myBaseUrl prefix
						if (url.includes('~/')) {
							url = u.replaceTildePlaceholder(url, myBaseUrl)
						}

						// Skip unrelated urls
						if (url.startsWith('http') && !/aitmed/i.test(url)) continue

						const metadata = u.getLinkMetadata({
							link: url,
							baseUrl: appConfig.baseUrl,
							prefix: 'assets',
							tilde: myBaseUrl,
						})

						// Re-assign raw because url was tampered
						metadata.raw = raw

						if (metadata.link) allUrls.push(metadata.link)

						if (u.isImg(url)) images.push(metadata)
						else if (u.isVid(url)) videos.push(metadata)
						else if (u.isPdf(url)) documents.push(metadata)
						else if (u.isJs(url) || u.isHtml(url)) scripts.push(metadata)

						allUrls.push(metadata.link as string)

						const filename = u.hasSlash(url) ? u.getFilename(url) : url

						if (localAssetFiles.includes(filename)) contained.push(metadata)
						else missing.push(metadata)
					}

					const configId = aggregator.config

					setCaption('\n')
					//
					;['images', 'documents', 'scripts', 'videos'].forEach((s) =>
						setCaption(
							`Found ${u.magenta(
								groupedMetadataObjects[s].length,
							)} ${s} in ${u.italic(configId)}`,
						),
					)

					setCaption(
						`\n${u.magenta(store.urls.length)} overall assets in ${u.magenta(
							configId,
						)} config`,
					)

					insertMissingFiles(missing)
					setStep(c.step.DOWNLOAD_ASSETS)
				})
				.run()
		} else {
			throw new Error('Invalid root or app config object')
		}
	}, [])

	return null
}

export default ScanAssets
