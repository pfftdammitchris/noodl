import fs from 'fs-extra'
import React from 'react'
import TextInput from 'ink-text-input'
import { getAbsFilePath } from 'noodl'
import useSettingsCtx from './useSettingsCtx.js'
import * as co from '../../utils/color.js'
import * as c from './constants.js'

export interface SettingsInitProps {
	onReady?(): void
}

function SettingsPromptDir({ onReady }: SettingsInitProps) {
	const [value, setValue] = React.useState('')
	const { setPrompt } = useSettingsCtx()

	const onChange = React.useCallback(
		(value: string) => value && setValue(value),
		[],
	)

	const onSubmit = React.useCallback((val: string) => {
		if (val) {
			const pathToGenerateDir = getAbsFilePath(val)
			if (!fs.existsSync(pathToGenerateDir)) {
				setPrompt({
					key: c.prompts.ASK_INSTANTIATE_GENERATE_PATH,
					dir: pathToGenerateDir,
				})
			} else {
				setPrompt({ key: '' })
				onReady?.()
			}
		}
	}, [])

	const placeholder = `Enter the path relative to the location (${co.white(
		`example: "../../dist/src"`,
	)})`

	return (
		<TextInput
			value={value}
			onChange={onChange}
			onSubmit={onSubmit}
			placeholder={placeholder}
		/>
	)
}

export default SettingsPromptDir
