import * as u from '@jsmanifest/utils'
import React from 'react'
import { Box, Newline, Text } from 'ink'
import Select from '../../components/Select'
import useCtx from '../../useCtx'
import useSettingsCtx from './useSettingsCtx'
import * as co from '../../utils/color'

export interface PromptInstantiateDirProps {
	onReady?(): void
}

function PromptInstantiateDir({ onReady }: PromptInstantiateDirProps) {
	const { configuration, log } = useCtx()
	const { prompt, setPrompt } = useSettingsCtx()

	const onSelect = React.useCallback(({ value }) => {
		if (value) {
			configuration.setPathToGenerateDir(prompt.dir as string, {
				onCreated(path) {
					setPrompt({ key: '' })
					log(`Created a new folder at ${co.yellow(path)}`)
					onReady?.()
				},
				onError({ error, path: pathToGenerateDir }) {
					if (error.code == 'EACCES') {
						log(
							u.red(
								`Permission was denied to create folder at ${co.yellow(
									pathToGenerateDir,
								)}. Try another path`,
							),
						)
					} else {
						console.error(`[${error.name}/${error.code}] ${error.message}`)
					}
				},
			})
		} else {
			setPrompt({ key: 'ask-generate-path' })
		}
	}, [])

	return (
		<Box flexDirection="column">
			<Text color="white">
				The path {co.yellow(prompt.dir)} does not exist. Would you like for it
				to be created?
			</Text>
			<Newline />
			<Select
				items={[
					{ value: true, label: 'Yes' },
					{ value: false, label: `No` },
				]}
				onSelect={onSelect}
			/>
		</Box>
	)
}

export default PromptInstantiateDir
