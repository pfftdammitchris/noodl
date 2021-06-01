import * as u from '@jsmanifest/utils'
import yaml from 'yaml'
import createAggregator from './createAggregator'
import * as com from '../../utils/common'
import * as n from '../../utils/noodl-utils'
import * as t from './types'

const createAssetAggregator = function _createAssetAggregators({
	assetsUrl,
	baseUrl,
	configKey,
	myBaseUrl,
	root,
}: Pick<
	ReturnType<typeof createAggregator>,
	'assetsUrl' | 'baseUrl' | 'configKey' | 'root'
> & { myBaseUrl: string }) {
	let assets = {}
	let hooks = {}

	const isLink = (s: string | undefined) =>
		s ? /^https?:\/\/[a-zA-Z]+/i.test(s) : false

	const toAssetLink = (s: string) => `${assetsUrl}/${s}`

	const o = {
		get assets() {
			return assets
		},
		async extractAssets({ onAsset }: { onAsset?(asset: string): void } = {}) {
			try {
				// Meta data objects ƒetched remotely
				const groupedMetadataObjects = {
					...com.createGroupedMetadataObjects(),
					allUrls: [] as string[],
				}

				const { documents, images, scripts, videos, allUrls } =
					groupedMetadataObjects

				const commonUrlKeys = ['path', 'resource', 'resourceUrl'] as string[]

				const addAsset = (asset: string) => {
					if (!allUrls.includes(asset)) {
						!isLink(asset) && (asset = toAssetLink(asset))
						allUrls.push(asset)
					}
				}

				function onAsset(asset: string) {
					const raw = asset
					// Calculate and re-assign as the full url
					// Asset urls that are dependent on the myBaseUrl prefix
					if (asset.includes('~/')) {
						asset = n.replaceTildePlaceholder(asset, myBaseUrl || baseUrl)
					}

					// Skip unrelated urls
					if (asset.startsWith('http') && !/aitmed/i.test(asset)) return

					const metadata = com.getLinkMetadata({
						link: asset,
						baseUrl,
						prefix: 'assets',
						tilde: myBaseUrl || baseUrl,
					}) as any

					// Re-assign raw because url was tampered
					metadata.raw = raw

					if (metadata.link) allUrls.push(metadata.link)

					if (com.isImg(asset)) images.push(metadata)
					else if (com.isVid(asset)) videos.push(metadata)
					else if (com.isPdf(asset)) documents.push(metadata)
					else if (com.isJs(asset) || com.isHtml(asset)) scripts.push(metadata)

					allUrls.push(metadata.link)

					const filename = com.hasSlash(asset) ? com.getFilename(asset) : asset

					console.log(filename)

					// if (localAssetFiles.includes(filename)) contained.push(metadata)
					// else missing.push(metadata)

					// setCaption('\n')
					//
					// ;['images', 'documents', 'scripts', 'videos'].forEach((s) =>
					// 	setCaption(
					// 		`Found ${u.magenta(
					// 			groupedMetadataObjects[s].length,
					// 		)} ${s} in ${u.italic(configKey)}`,
					// 	),
					// )

					// setCaption(
					// 	`\n${u.magenta(store.urls.length)} overall assets in ${co.magenta(
					// 		configKey,
					// 	)} config`,
					// )

					// insertMissingFiles(missing)
					// setStep(c.step.DOWNLOAD_ASSETS)
					// setOn({
					// 	[c.step.DOWNLOAD_ASSETS]: {
					// 		end: { setPanel: 'RUN_SERVER' },
					// 	},
					// })
				}

				for (const [key, visitee] of root) {
					if (yaml.isNode(visitee) || yaml.isDocument(visitee)) {
						yaml.visit(visitee, {
							Map(key, node) {
								for (const key of commonUrlKeys) {
									if (node.has(key)) {
										const value = node.get(key)
										if (u.isStr(value)) {
											addAsset(value)
										}
									}
								}
							},
							Scalar(key, node) {
								if (u.isStr(node.value)) {
									if (isLink(node.value)) {
										addAsset(node.value)
									}
								}
							},
						})
					}
				}

				return groupedMetadataObjects
			} catch (error) {
				throw error
			}
		},
	}

	return o
}

export default createAssetAggregator
