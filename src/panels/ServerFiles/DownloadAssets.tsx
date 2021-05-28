import React from 'react'
import produce from 'immer'
import download from 'download'
import useCtx from '../../useCtx'
import useServerFilesCtx from './useServerFilesCtx'
import { panel as panelId } from '../../constants'
import * as u from '../../utils/common'
import * as c from './constants'
import * as T from './types'

export type Action =
	| {
			type: typeof c.action.DOWNLOAD
			file: T.ServerFilesFile | T.ServerFilesFile[]
	  }
	| { type: typeof c.action.DOWNLOADED; link: string }
	| { type: typeof c.action.DOWNLOAD_FAILED; link: string; error: Error }

export interface State {
	downloading: { [link: string]: T.ServerFilesFile }
	downloaded: { [link: string]: T.ServerFilesFile }
	failed: { [link: string]: T.ServerFilesFile }
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

function DownloadAssets() {
	const [state, dispatch] = React.useReducer(reducer, initialState)
	const { panel, settings, setCaption, spinner, toggleSpinner, updatePanel } =
		useCtx()
	const { files, on } = useServerFilesCtx()

	React.useEffect(() => {
		const isNew = (link: string) =>
			!state.downloading[link] && !state.downloaded[link] && !state.failed[link]

		for (const metadataObjs of Object.values(files.missing)) {
			for (const file of Object.values(metadataObjs)) {
				file?.link &&
					isNew(file.link) &&
					dispatch({ type: c.action.DOWNLOAD, file })
			}
		}
	}, [files.missing])

	React.useEffect(() => {
		const pendingLinks = Object.keys(state.downloading)

		async function downloadAsset(file: T.ServerFilesFile) {
			setCaption(`[${u.magenta(file.group)}] Downloading ${u.white(file.link)}`)
			if (file?.link) {
				try {
					await download(
						file.link,
						com.getAbsFilePath(settings.server.dir, 'assets'),
					)
				} catch (error) {
					setCaption(`[${u.red(file.filename)}]: ${u.yellow(error.message)}`)
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
			if (
				on[c.step.DOWNLOAD_ASSETS]?.end?.setPanel ===
					panelId.RUN_SERVER.value &&
				panel.value !== panelId.RUN_SERVER.value
			) {
				updatePanel({ value: panelId.RUN_SERVER.value })
			}
		})
	}, [state.downloading])

	React.useEffect(() => {
		if (state.downloading.length && !spinner) toggleSpinner()
		else if (!state.downloading.length && spinner) toggleSpinner(false)
	}, [state.downloading])

	return null
}

export default DownloadAssets
