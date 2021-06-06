import { IncomingMessage } from 'http'
import React from 'react'
import merge from 'lodash/merge'
import produce, { Draft } from 'immer'
import downloadFile from 'download'
import * as u from '@jsmanifest/utils'
import * as com from '../utils/common'
import * as co from '../utils/color'
import * as t from '../types'

export interface Options {
	options?: downloadFile.DownloadOptions
	onDownloadProgress?(args: Omit<DownloadObject, 'state'>): void
	onResponse?(response: IncomingMessage): void
	onError?(args: { error: Error; url: string }): void
	onEnd?(): void
}

export interface DownloadProgress {
	percent: string
	total: number
	transferred: number
}

export interface DownloadObject extends DownloadProgress {
	state: 'downloading' | 'downloaded' | 'error'
	url: string
}

const initialState = {
	downloading: {} as Record<string, DownloadObject>,
	downloaded: {} as Record<string, DownloadObject>,
	urlsInProgress: [] as string[],
	urlsDownloaded: [] as string[],
}

function useDownload({
	onDownloadProgress: onDownloadProgressProp,
	onError: onErrorProp,
	onEnd: onEndProp,
	onResponse: onResponseProp,
	options: optionsProp,
}: Options = {}) {
	const [state, _setState] = React.useState(initialState)

	const setState = React.useCallback(
		(
			fn:
				| Partial<typeof initialState>
				| ((draft: Draft<typeof initialState>) => void),
		) => {
			_setState(
				produce((draft) => {
					if (typeof fn === 'object') merge(draft, fn)
					else fn(draft)
				}),
			)
		},
		[],
	)

	const download = React.useCallback(
		async ({
			destination = '',
			label = '',
			prefix = '',
			url = '',
			onDownloadProgress,
			onEnd,
			onError,
			onResponse,
			options,
		}: {
			destination?: string
			label?: string
			prefix?: string
			url: string
		} & Pick<
			Options,
			'onDownloadProgress' | 'onEnd' | 'onError' | 'onResponse' | 'options'
		>) => {
			try {
				setState((draft) => {
					const urls = [...draft.urlsInProgress, ...draft.urlsDownloaded]
					const downloadObject = { url, state: 'downloading' }
					if (!urls.includes(url)) {
						draft.downloading[url] = downloadObject as DownloadObject
						draft.urlsInProgress.push(url)
					}
				})

				let progress:
					| (Promise<Buffer> & NodeJS.WritableStream & NodeJS.ReadableStream)
					| undefined

				try {
					progress = downloadFile(url, destination, optionsProp)
				} catch (error) {
					console.error(error)
				}

				progress
					?.on('response', (req) => {
						onResponse?.(req)
						onResponseProp?.(req)
					})
					.on('downloadProgress', (currentProgress: DownloadProgress) => {
						setState((draft) => {
							u.assign(draft.downloading[url], currentProgress)
						})
						onDownloadProgress?.({ ...currentProgress, url })
						onDownloadProgressProp?.({ ...currentProgress, url })
					})
					.on('finish', () => {
						setState((draft) => {
							draft.downloaded[url] = draft.downloading[url]
							draft.downloaded[url].state = 'downloaded'
							delete draft.downloading[url]
							const index = draft.urlsInProgress.indexOf(url)
							if (index > -1) draft.urlsInProgress.splice(index, 1)
							if (!draft.urlsDownloaded.includes(url)) {
								draft.urlsDownloaded.push(url)
							}
						})
						onEnd?.()
						onEndProp?.()
					})
					.on('error', (error) => {
						setState((draft) => {
							draft.downloading[url].state = 'error'
							const index = draft.urlsInProgress.indexOf(url)
							if (index > -1) draft.urlsInProgress.splice(index, 1)
						})
						onError?.({ error, url })
						onErrorProp?.({ error, url })
					})
				await progress
			} catch (error) {
				if (/(404|not found)/i.test(error.message)) {
					console.error(`[${co.red(`Not Found`)}] ${co.yellow(url)}`)
				} else {
					console.error(`[${co.red(label || url)}] ${co.yellow(error.message)}`)
				}
			}
		},
		[],
	)

	React.useEffect(() => {
		//
	}, [])

	return {
		...state,
		download,
	}
}

export default useDownload
