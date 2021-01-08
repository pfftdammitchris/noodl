import React from 'react'
import download from 'download'
import produce, { Draft } from 'immer'
import { WritableDraft } from 'immer/dist/internal'
import { Box, Text } from 'ink'
import { isImg, isPdf, isVid, magenta } from '../utils/common'
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
	else return undefined
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
	const { server, setCaption, setErrorCaption } = useCtx()

	const previousLinks = React.useMemo(
		() => state.downloaded.concat(state.downloading, state.pending),
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
			const url = state.pending[state.pending.length - 1] as string
			dispatch({ type: serverScript.action.DOWNLOAD_ASSET, url })
			const assetType = getAssetType(url)
			setCaption(`Downloading: ${magenta(url)}`)
			download(url, server.dir)
				.then(() => setCaption(`Downloaded ${magenta(url)}`))
				.catch(setErrorCaption)
		}
	}, [state.pending])

	return <Box flexDirection="column">{null}</Box>
}

export default StartServerDownloadAssets
