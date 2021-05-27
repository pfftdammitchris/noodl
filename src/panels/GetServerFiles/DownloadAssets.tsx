import * as u from '@jsmanifest/utils'
import React from 'react'
import produce from 'immer'
import download from 'download'
import useCtx from '../../useCtx'
import useServerFilesCtx from './useServerFilesCtx'
import * as com from '../../utils/common'
import * as c from './constants'
import * as t from './types'

export interface DownloadAssetsProps {
	onEnd?(): void
}

export type Action =
	| {
			type: typeof c.action.DOWNLOAD
			file: t.GetServerFiles.File | t.GetServerFiles.File[]
	  }
	| { type: typeof c.action.DOWNLOADED; link: string }
	| { type: typeof c.action.DOWNLOAD_FAILED; link: string; error: Error }

export interface State {
	downloading: { [link: string]: t.GetServerFiles.File }
	downloaded: { [link: string]: t.GetServerFiles.File }
	failed: { [link: string]: t.GetServerFiles.File }
}

const initialState: State = {
	downloading: {},
	downloaded: {},
	failed: {},
}

function reducer(state: State = initialState, action: Action) {
	return produce(state, (draft) => {
		switch (action.type) {
			case c.action.DOWNLOAD: {
				const files = Array.isArray(action.file) ? action.file : [action.file]
				return void files.forEach((file) => {
					draft.downloading[file.link as string] = {
						...file,
						status: c.file.status.DOWNLOADING,
					}
				})
			}
			case c.action.DOWNLOADED: {
				break
			}
			case c.action.DOWNLOAD_FAILED: {
				break
			}
		}
	})
}

function DownloadAssets(props: DownloadAssetsProps) {
	const [state, dispatch] = React.useReducer(reducer, initialState)
	const { log, settings, spinner, toggleSpinner } = useCtx()
	const { filesMissing } = useServerFilesCtx()

	React.useEffect(() => {
		const isNew = (link: string) =>
			!state.downloading[link] && !state.downloaded[link] && !state.failed[link]

		for (const metadataObjs of u.values(filesMissing)) {
			for (const file of u.values(metadataObjs)) {
				file?.link &&
					isNew(file.link) &&
					dispatch({ type: c.action.DOWNLOAD, file })
			}
		}
	}, [filesMissing])

	React.useEffect(() => {
		const pendingLinks = u.keys(state.downloading)

		async function downloadAsset(file: t.GetServerFiles.File) {
			log(
				`[${u.magenta(file.group)}] Downloading ${u.white(
					file.link as string,
				)}`,
			)
			if (file?.link) {
				try {
					await download(
						file.link,
						com.getAbsFilePath(settings.server.dir, 'assets'),
					)
				} catch (error) {
					log(`[${u.red(file.filename)}]: ${u.yellow(error.message)}`)
				}
			}
		}

		Promise.all(
			pendingLinks.reduce((acc, link) => {
				if (state.downloading[link]) {
					return acc.concat(downloadAsset(state.downloading[link]))
				}
				return acc
			}, [] as ReturnType<typeof downloadAsset>[]),
		).finally(() => {
			props?.onEnd?.()
		})
	}, [state.downloading])

	React.useEffect(() => {
		if (state.downloading.length && !spinner) toggleSpinner()
		else if (!state.downloading.length && spinner) toggleSpinner(false)
	}, [state.downloading])

	return null
}

export default DownloadAssets
