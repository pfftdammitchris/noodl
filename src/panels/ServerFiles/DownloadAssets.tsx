import React from 'react'
import debounce from 'lodash/debounce'
import fs from 'fs-extra'
import path from 'path'
import produce from 'immer'
import download from 'download'
import useCtx from '../../useCtx'
import useServerFilesCtx from './useServerFilesCtx'
import { createMetadataReducer } from './helpers'
import * as u from '../../utils/common'
import * as c from './constants'
import * as T from './types'

const createImageReducer = createMetadataReducer(
	(stat, filepath) =>
		stat.isFile() &&
		(u.isImg(filepath) || u.isHtml(filepath) || u.isJs(filepath)),
)
const createYmlReducer = createMetadataReducer(
	(stat, filepath) => stat.isFile() && u.isYml(filepath),
)

export type Action =
	| {
			type: typeof c.action.DOWNLOAD
			file: T.ServerFilesFile | T.ServerFilesFile[]
	  }
	| { type: 'downloading'; url: string | string[] }
	| { type: 'downloaded'; url: string | string[] }

export interface State {
	pending: string[]
	downloading: string[]
	downloaded: string[]
}

export interface DownloadAssetsProps {
	onDownload?(opts: { url: string } & State): void
	onProgress?(
		opts: { url: string } & State & {
				percent: number
				transferred: number
				total: number
			},
	): void
	onError?(args: { error: Error; url: string } & State): void
}

const createDownloadProgressObject = () => ({
	pending: [],
	downloading: [],
	downloaded: [],
})

const initialState: State = {
	pending: [],
	downloading: [],
	downloaded: [],
}

function reducer(state: State = initialState, action: Action) {
	return produce(state, (draft) => {
		switch (action.type) {
			case c.action.DOWNLOAD: {
				const files = Array.isArray(action.file) ? action.file : [action.file]
				return void files.forEach((file) => {
					draft[file.link] = {
						...file,
						status: c.file.status.DOWNLOADING,
					}
				})
			}
			case 'downloading':
				const urls = Array.isArray(action.url) ? action.url : [action.url]
				return void draft.downloading.push(...urls)
			case 'downloaded': {
				const urls = Array.isArray(action.url) ? action.url : [action.url]
				return void (draft.downloading = draft.downloading.filter(
					(url) => !urls.includes(url),
				))
			}
		}
	})
}

function DownloadAssets({
	onDownload,
	onProgress,
	onError,
}: DownloadAssetsProps) {
	const [state, dispatch] = React.useReducer(reducer, initialState)
	const { setCaption, spinner, toggleSpinner } = useCtx()
	const { files, consumeMissingFiles } = useServerFilesCtx()

	const imgReducer = createImageReducer(assetsDir)
	const ymlReducer = createYmlReducer(serverDir)

	const ymlMetadataObjects = fs
		.readdirSync(serverDir, 'utf8')
		.reduce(ymlReducer, [] as T.MetadataObject[])

	const assetsMetadataObjects = fs
		.readdirSync(assetsDir)
		.reduce(imgReducer, [] as T.MetadataObject[])

	setCaption(
		`\nLoaded ${u.magenta(
			ymlMetadataObjects.length,
		)} yml files in your server folder`,
	)
	setCaption(
		`Loaded ${u.magenta(
			assetsMetadataObjects.length,
		)} asset files in your server folder\n`,
	)

	setCaption(u.captioning(`Scanning for missing assets...`))

	setCaption(
		u.captioning(
			`\nDownloading ${u.yellow(missingAssets.length)} missing assets...\n`,
		),
	)

	React.useEffect(() => {
		const add = (file: T.ServerFilesFile) => {
			dispatch({ type: c.action.DOWNLOAD, file })
		}

		for (const obj of Object.values(files.missing)) {
			const links = Object.keys(obj)

			links.forEach((link) => {
				if (!state[link]) {
					const file = obj[link] as T.ServerFilesFile
					add(file)
				}
			})
		}
	}, [files.missing])

	React.useEffect(() => {
		if (state.pending.length) {
			async function downloadAsset(url: string) {
				onDownload?.({ url, ...state })
				const result = download(url)
				const fn = debounce((args) => {
					onProgress?.({ ...args, ...state, url })
				}, 1000)
				result.on('downloadProgress', fn)
				try {
					await result
					dispatch({ type: 'downloaded', url })
				} catch (error) {
					onError?.({ error, url, ...state })
				}
			}

			state.pending.forEach((url) => {
				downloadAsset(url)
				dispatch({ type: 'downloading', url })
			})
		}
	}, [state.pending, state.downloading, state.downloaded])

	React.useEffect(() => {
		if (state.downloading.length && !spinner) toggleSpinner()
		else if (!state.downloading.length && spinner) toggleSpinner(false)
	}, [state.downloading])

	return null
}

export default DownloadAssets
