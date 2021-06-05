import * as u from '@jsmanifest/utils'
import { Newline, Text } from 'ink'
import fs from 'fs-extra'
import React from 'react'
import HighlightedText from '../../components/HighlightedText'
import Select from '../../components/Select'
import useCtx from '../../useCtx'
import useSettingsCtx from './useSettingsCtx'
import * as co from '../../utils/color'

export interface SettingsInitProps {
	onReady?(): void
}

function SettingsInit({ onReady }: SettingsInitProps) {
	const { configuration, log } = useCtx()
	const { setPrompt } = useSettingsCtx()

	const onSelect = React.useCallback((item) => {
		configuration.initTimestamp()
		if (item.value) {
			configuration.setPathToGenerateDir('default', {
				onCreated(path) {
					return log(`Created a new folder at ${co.yellow(path)}`)
				},
				onError({ error, path }) {
					if (error.code == 'EACCES') {
						log(
							u.red(
								`Could not create dir at "${path}". Permission was denied.`,
							),
						)
					} else if (!fs.existsSync(path)) {
						setPrompt({ key: 'ask-instantiating-generate-path', dir: path })
					} else {
						console.error(`Error creating folder at ${path}: ${error.message}`)
					}
				},
			})
			onReady?.()
		} else {
			setPrompt({ key: 'ask-generate-path' })
		}
	}, [])

	return (
		<>
			<HighlightedText>Welcome!</HighlightedText>
			<Text>It seems like this is your first time using this app.</Text>
			<Text>
				The default directory for generating output will be set to{' '}
				<Text color="yellow">{configuration.getDefaultGenerateDir()}</Text>
			</Text>
			<Text>Would you like to continue with this setting?</Text>
			<Newline />
			<Select
				onSelect={onSelect}
				items={[
					{ value: true, label: 'Yes' },
					{ value: false, label: `No. Set a different location` },
				]}
			/>
			<Newline />
		</>
	)
}

export default SettingsInit
