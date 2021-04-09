import React from 'react'
import { Box, BoxProps } from 'ink'
import { UncontrolledTextInput } from 'ink-text-input'
import { Provider } from './useServerFilesCtx'
import { ServerFilesContext } from './types'
import useServerFiles from './useServerFiles'
import HighlightedText from '../../components/HighlightedText'
import Spinner from '../../components/Spinner'
import ScanAssets from './ScanAssets'
import DownloadAssets from './DownloadAssets'
import * as u from '../../utils/common'
import * as c from './constants'

function ServerFiles() {
	const {
		files,
		consumeMissingFiles,
		insertMissingFiles,
		runConfig,
		step,
		setStep,
	} = useServerFiles()

	const ctx: ServerFilesContext = {
		files,
		step,
		consumeMissingFiles,
		insertMissingFiles,
		setStep,
	}

	const Container = React.memo(
		({
			children,
			label,
			...rest
		}: React.PropsWithChildren<BoxProps> & { label?: string }) => (
			<Box padding={1} flexDirection="column" {...rest}>
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
		component = <ScanAssets />
	} else if (step === c.step.DOWNLOAD_ASSETS) {
		component = <DownloadAssets />
	} else {
		component = null
	}

	return <Provider value={ctx}>{component}</Provider>
}

export default ServerFiles
