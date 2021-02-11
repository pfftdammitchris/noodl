import React from 'react'
import { Box, BoxProps } from 'ink'
import { UncontrolledTextInput } from 'ink-text-input'
import { getAssetType } from './helpers'
import { Provider } from './useServerFilesCtx'
import { ServerFilesContext } from './types'
import useServerFiles from './useServerFiles'
import useCtx from '../../useCtx'
import HighlightedText from '../../components/HighlightedText'
import Spinner from '../../components/Spinner'
import ScanAssets from './ScanAssets'
import DownloadAssets, { DownloadAssetsProps } from './DownloadAssets'
import * as u from '../../utils/common'
import * as c from './constants'

function ServerFiles() {
	const { setCaption } = useCtx()
	const {
		insertMissingFiles,
		files,
		runConfig,
		step,
		setStep,
	} = useServerFiles()

	const ctx: ServerFilesContext = {
		files,
		step,
		insertMissingFiles,
		setStep,
	}

	const onDownloadStart = React.useCallback(
		// @ts-expect-error
		async ({ url }: Parameters<DownloadAssetsProps['onDownload']>[0]) => {
			setCaption(
				`Downloading ${u.yellow(getAssetType(url))}: ${u.magenta(url)}`,
			)
		},
		[],
	)

	const onDownloadError = React.useCallback(
		// @ts-expect-error
		async ({ error, asset }: Parameters<DownloadAssetsProps['onError']>[0]) => {
			setCaption(
				`[${u.red(error.name)}]: ${u.yellow(error.message)} (${asset})`,
			)
		},
		[],
	)

	const Container = React.memo(
		({
			children,
			label,
			...rest
		}: React.PropsWithChildren<BoxProps> & { label?: string }) => (
			<Box flexDirection="column" {...rest}>
				{label ? <HighlightedText>{label}</HighlightedText> : null}
				{children}
			</Box>
		),
	)

	let component: React.ReactNode

	if (step === c.step.INITIALIZING) {
		component = <Spinner />
	} else if (step === c.step.PROMPT_CONFIG) {
		component = (
			<Container label="Which config should we use?">
				<UncontrolledTextInput
					onSubmit={runConfig}
					placeholder={`Enter the config here ${u.white(
						`(example: ${u.magenta('meet2d')})`,
					)}`}
				/>
			</Container>
		)
	} else if (step === c.step.SCAN_ASSETS) {
		component = (
			<ScanAssets insertMissingFiles={insertMissingFiles} setStep={setStep} />
		)
	} else if (step === c.step.DOWNLOAD_ASSETS) {
		component = (
			<DownloadAssets
				files={files}
				onDownload={onDownloadStart}
				onError={onDownloadError}
			/>
		)
	} else {
		component = null
	}

	return <Provider value={ctx}>{component}</Provider>
}

export default ServerFiles
