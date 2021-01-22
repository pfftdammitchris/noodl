import React from 'react'
import chalk from 'chalk'
import download from 'download'
import produce, { Draft } from 'immer'
import uniq from 'lodash/uniq'
import { WritableDraft } from 'immer/dist/internal'
import Progress from 'ink-progress-bar'
import { Box, Static } from 'ink'
import {
	isImg,
	isJs,
	isPdf,
	isVid,
	magenta,
	highlight,
	red,
} from '../utils/common'
import { serverScript } from '../constants'
import useCtx from '../useCtx'

export type Action =
	| { type: typeof serverScript.action.DOWNLOAD_ASSET; url: string }
	| { type: typeof serverScript.action.SET_PENDING; url: string }
	| { type: 'next' }

export interface State {
	pending: string[]
	downloading: string[]
	downloaded: string[]
	images: string[]
	pdf: string[]
	videos: string[]
	other: string[]
}

const initialState: State = {
	pending: [],
	downloading: [],
	downloaded: [],
	images: [],
	pdf: [],
	videos: [],
	other: [],
}

function getAssetType(url: string) {
	if (isImg(url)) return 'image'
	else if (isVid(url)) return 'video'
	else if (isPdf(url)) return 'pdf'
	else if (isJs(url)) return 'javascript'
	else if (url.endsWith('.html')) return 'html'
	else if (url.endsWith('.yml')) return 'yaml'
	else if (url.endsWith('.json')) return 'json'
	else return ''
}

function insertAssetType(url: string, draft: Draft<State>): void {
	if (isImg(url)) draft.images.push(url)
	else if (isVid(url)) draft.videos.push(url)
	else if (isPdf(url)) draft.pdf.push(url)
	else draft.other.push(url)
}

const reducer = produce((draft: WritableDraft<State>, action: Action) => {
	switch (action.type) {
		case serverScript.action.DOWNLOAD_ASSET:
			if (draft.pending.includes(action.url)) {
				draft.downloading.push(
					draft.pending.splice(
						draft.pending.indexOf(action.url),
						1,
					)[0] as string,
				)
			}
			break
		case serverScript.action.SET_PENDING:
			return void draft.pending.push(action.url)
		case 'next':
			const url = draft.pending.pop() as string
			draft.downloading.push(url)
			return void insertAssetType(url, draft)
	}
})

function StartServerDownloadAssets({ assets = [] }: { assets: string[] }) {
	const [state, dispatch] = React.useReducer(reducer, initialState)
	const { aggregator, server, setCaption, setErrorCaption } = useCtx()

	const previousLinks = React.useMemo(
		() => uniq(state.downloaded.concat(state.downloading, state.pending)),
		[state.downloaded, state.downloading, state.pending],
	)

	React.useEffect(() => {
		assets.forEach((url) => {
			if (!previousLinks.includes(url)) {
				dispatch({ type: serverScript.action.SET_PENDING, url })
			}
		})
	}, [assets])

	React.useEffect(() => {
		if (state.pending.length && state.downloading.length < 10) {
			const assetType = getAssetType(url)
			const assetsUrl = aggregator.get('cadlEndpoint').json?.assetsUrl || ''
			const path = state.pending[state.pending.length - 1] as string
			const url = path.startsWith('http') ? path : assetsUrl + path
			dispatch({ type: serverScript.action.DOWNLOAD_ASSET, url })
			setCaption(`Downloading ${chalk.whiteBright(url)} to your assets folder`)
			download(url, server.dir)
				.then(() => {
					setCaption(
						`Downloaded ${chalk.whiteBright(assetType)} file ${magenta(url)}`,
					)
				})
				.catch((err: Error) => {
					if (/notfound/i.test(err.message)) {
						setCaption(`${highlight(url)} ${red('does not exist')}`)
					} else {
						setErrorCaption(err)
					}
				})
		}
	}, [state.pending, state.downloading])

	return <Progress />
}

export default StartServerDownloadAssets
