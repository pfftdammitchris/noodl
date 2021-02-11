import React from 'react'
import yaml from 'yaml'
import fs from 'fs-extra'
import path from 'path'
import useCtx from '../../useCtx'
import createObjectScripts from '../../api/createObjectScripts'
import scriptObjs, { id as scriptId } from '../../utils/scripts'
import useServerFilesCtx from './useServerFilesCtx'
import { RootConfig, AppConfig } from '../../types'
import { getFilepathMetadata } from './helpers'
import * as T from './types'
import * as u from '../../utils/common'
import * as c from './constants'

/**
 * This expects the serverDir to have been populated with files either from a previous script
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
			const preloadPages = appConfig.preload
			const pages = appConfig.page
			const scripts = createObjectScripts()
			const ymlDocs = [...preloadPages, ...pages].map((p) =>
				yaml.parseDocument(p),
			)

			scripts.data(ymlDocs)
			scripts
				.use(scriptObjs[scriptId.RETRIEVE_URLS])
				.on('start', (store) => !store.urls && (store.urls = []))
				.on('end', (store) => {
					store.urls = store.urls.sort()
					const groupedAssets = u.groupAssets(store.urls)
					const { images, other, pdfs, videos } = groupedAssets

					u.newline()

					setCaption(
						`Found ${u.magenta(images.length)} image assets in ${
							aggregator.config
						}`,
					)
					setCaption(
						`Found ${u.magenta(pdfs.length)} pdf assets in ${
							aggregator.config
						}`,
					)
					setCaption(
						`Found ${u.magenta(videos.length)} video assets in ${
							aggregator.config
						}`,
					)
					setCaption(
						`Found ${u.magenta(other.length)} other assets in ${
							aggregator.config
						}`,
					)
					setCaption(
						`\n${u.magenta(
							store.urls.length,
						)} overall assets in config ${u.magenta(aggregator.config)}\n`,
					)

					fs.ensureDirSync(assetsDir)

					const userAssets = fs.readdirSync(assetsDir)
					const myBaseUrl = rootConfig?.myBaseUrl || ''

					const [existentAssets, missingAssets] = userAssets.reduce(
						(acc: [string[], string[]], asset = '') => {
							// Skip unrelated urls
							if (asset.startsWith('http') && !/aitmed/i.test(asset)) return acc
							// Handle urls that are dependent on their "app"'s name
							if (asset.includes('~/') && myBaseUrl) {
								if (asset.startsWith('~/')) {
									asset = asset.replace('~/', myBaseUrl)
								} else {
									asset = myBaseUrl + asset.substring(asset.indexOf('~/') + 2)
									if (/[a-zA-Z0-9]\/\//i.test(asset)) {
										let startIndex = asset.search(/[a-zA-Z0-9]\/\//i)
										if (startIndex > -1) {
											startIndex = startIndex + 1
											const firstHalf = asset.substring(0, startIndex)
											const lastHalf = asset.substring(startIndex + 2)
											asset = firstHalf + lastHalf
										}
									}
								}
							}
							let pathname: string
							if (asset.includes('/')) {
								pathname = asset.substring(asset.lastIndexOf('/') + 1)
							} else {
								pathname = asset
							}
							if (userAssets.includes(encodeURIComponent(pathname))) {
								acc[0].push(asset)
							} else {
								acc[1].push(asset)
							}
							return acc
						},
						[[], []],
					)

					setCaption(
						`You have ${u.yellow(existentAssets.length)} of ${u.yellow(
							store.urls.length,
						)} assets`,
					)

					insertMissingFiles(
						missingAssets.reduce(
							(acc, filepath) => {
								const obj = getFilepathMetadata({ filepath, prefix: 'assets' })
								if (obj.group === 'document') acc.documents.push(obj)
								else if (obj.group === 'image') acc.images.push(obj)
								else if (obj.group === 'video') acc.videos.push(obj)
								return acc
							},
							{
								documents: [],
								images: [],
								videos: [],
							} as T.GroupedMetadataObjects,
						),
					)

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
