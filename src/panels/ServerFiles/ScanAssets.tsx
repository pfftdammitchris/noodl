import React from 'react'
import yaml from 'yaml'
import fs from 'fs-extra'
import path from 'path'
import useCtx from '../../useCtx'
import Scripts from '../../api/Scripts'
import Utils from '../../api/Utils'
import useServerFilesCtx from './useServerFilesCtx'
import { Noodl } from '../../types'
import * as T from './types'
import * as u from '../../utils/common'
import * as c from './constants'

/**
 * This expects the serverDir to have been applyd with files either from a previous script
 * or manually. The aggregator should also have its rootConfig and appConfig loaded
 */
function ScanAssets() {
	const { aggregator, settings, setCaption } = useCtx()
	const { insertMissingFiles, setOn, setStep } = useServerFilesCtx()

	React.useEffect(() => {
		const rootConfig = aggregator.builder.rootConfig.json as Noodl.RootConfig
		const appConfig = aggregator.builder.appConfig.json as Noodl.AppConfig
		const assetsDir = path.join(settings.server.dir, 'assets')

		if (rootConfig && appConfig) {
			const myBaseUrl = rootConfig.myBaseUrl || ''
			const preloadPages = appConfig.preload
			const pages = appConfig.page
			const scripts = new Scripts({
				dataFilePath: '',
				// @ts-expect-error
				docs: [...preloadPages, ...pages].reduce((acc, p) => {
					const filepath = u.getFilePath(settings.server.dir, `${p}.yml`)
					if (fs.existsSync(filepath)) {
						return acc.concat({
							name: p,
							doc: yaml.parseDocument(fs.readFileSync(filepath, 'utf8')),
						})
					} else {
						setCaption(`${u.red(p)} is not found`)
					}
					return acc
				}, [] as { name: string; doc: yaml.Document | yaml.Document.Parsed }[]),
			})

			scripts
				.use({
					script: [
						(store) => ({
							key: 'urls',
							type: 'array',
							label: 'Retrieve all urls/paths',
							fn({ node }) {
								if (Utils.identify.scalar.url(node) && u.isStr(node.value)) {
									if (!store.urls.includes(node.value)) {
										store.urls.push(node.value)
									}
								}
							},
						}),
					],
					// onStart: (store) => !store.urls && (store.urls = []),
					onEnd(store) {
						console.log(store)
						store.urls = store.urls.sort()

						const contained = [] as T.MetadataObject[]
						const missing = [] as T.MetadataObject[]

						fs.ensureDirSync(assetsDir)

						const localAssetFiles = fs.readdirSync(assetsDir)
						// Meta data objects ƒetched remotely
						const groupedMetadataObjects = {
							...u.createGroupedMetadataObjects(),
							allUrls: [],
						} as T.GroupedMetadataObjects & { allUrls: string[] }

						const { documents, images, scripts, videos, allUrls } =
							groupedMetadataObjects

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
						setOn({
							[c.step.DOWNLOAD_ASSETS]: {
								end: { setPanel: 'RUN_SERVER' },
							},
						})
					},
				})
				.run()
		} else {
			throw new Error('Invalid root or app config object')
		}
	}, [])

	return null
}

export default ScanAssets
