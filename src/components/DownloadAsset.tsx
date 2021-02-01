import React from 'react'
import produce from 'immer'
import debounce from 'lodash/debounce'
import { WritableDraft } from 'immer/dist/internal'
import download from 'download'
import useCtx from '../useCtx'

interface AssetObject {
	asset: string
	link: string
}

export type Action =
	| { type: 'download'; url: string }
	| { type: 'download.batch'; assets: AssetObject[] }
	| { type: 'downloaded'; asset: AssetObject }

export interface State {
	downloading: AssetObject[]
	downloaded: AssetObject[]
	ids: { [asset: string]: AssetObject }
}

export interface DownloadAssetProps {
	urls: string[]
	to: string
	onDownload?(opts: AssetObject & State & { to: string }): void
	onProgress?(
		opts: AssetObject &
			State & {
				percent: number
				transferred: number
				total: number
			},
	): void
	onError?(args: { error: Error } & State & AssetObject): void
}

const initialState: State = {
	downloading: [],
	downloaded: [],
	ids: {},
}

const reducer = produce(
	(draft: WritableDraft<State> = initialState, action: Action): void => {
		const remove = (arr: AssetObject[], value: AssetObject) => {
			const index = arr.findIndex((v) => v.asset === value.asset)
			index !== -1 && arr.splice(index, 1)
		}
		switch (action.type) {
			case 'download.batch': {
				return void action.assets.forEach((arg) => {
					draft.ids[arg.asset] = arg
					draft.downloading.push(arg)
				})
			}
			case 'downloaded':
				return void remove(draft.downloading, action.asset)
		}
	},
)

function DownloadAsset({
	urls,
	to = '',
	onDownload,
	onProgress,
	onError,
}: DownloadAssetProps) {
	const [state, dispatch] = React.useReducer(reducer, initialState)
	const { aggregator } = useCtx()

	React.useEffect(() => {
		const assetObjs = [] as AssetObject[]
		const assetsUrl = aggregator.get('cadlEndpoint')?.assetsUrl || ''

		urls.forEach((asset) => {
			const link = asset.startsWith('http') ? asset : assetsUrl + asset
			if (!state?.ids[asset]) assetObjs.push({ asset, link })
		})

		dispatch({ type: 'download.batch', assets: assetObjs })
	}, [urls])

	return (
		<>
			{state?.downloading.map((asset) => (
				<Download
					key={asset.asset}
					state={state as State}
					asset={asset}
					to={to}
					onDownload={onDownload}
					onProgress={onProgress}
					onError={onError}
				/>
			))}
		</>
	)
}

const Download = React.memo(
	({
		asset,
		to,
		onDownload,
		onProgress,
		onError,
		state,
	}: {
		asset: AssetObject
		to: string
		onDownload: DownloadAssetProps['onDownload']
		onProgress: DownloadAssetProps['onProgress']
		onError: DownloadAssetProps['onError']
		state: State
	}) => {
		React.useEffect(() => {
			const dl = async () => {
				onDownload?.({ ...asset, ...state, to })
				const result = download(asset.link, to)
				const fn = debounce((args) => {
					onProgress?.({ ...args, ...asset, ...state })
				}, 1000)
				result.on('downloadProgress', fn)
				try {
					await result
				} catch (error) {
					onError?.({ error, ...asset, ...state })
				}
			}
			dl()
		}, [])

		return null
	},
)

export default DownloadAsset
