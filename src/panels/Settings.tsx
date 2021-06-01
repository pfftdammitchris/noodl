import * as u from '@jsmanifest/utils'
import React from 'react'
import merge from 'lodash/merge'
import fs from 'fs-extra'
import { PartialDeep } from 'type-fest'
import { Box, Newline, Text } from 'ink'
import { UncontrolledTextInput } from 'ink-text-input'
import produce, { Draft } from 'immer'
import Panel from '../components/Panel'
import Select from '../components/Select'
import HighlightedText from '../components/HighlightedText'
import useCtx from '../useCtx'
import * as co from '../utils/color'
import * as com from '../utils/common'
import * as c from '../constants'

export type State = typeof initialState

const initialState = {
	prompt: {} as {
		key:
			| null
			| ''
			| 'init'
			| 'ask-generate-path'
			| 'ask-instantiating-generate-path'
		dir?: string
	},
	options: {},
}

function Settings({ onReady }: { onReady?(): void }) {
	const { log, settings } = useCtx()
	const [state, _setState] = React.useState(initialState)

	const setState = React.useCallback(
		(fn: ((draft: Draft<State>) => void) | Partial<PartialDeep<State>>) => {
			_setState(
				produce((draft) => {
					if (u.isFnc(fn)) fn(draft)
					else if (u.isObj(fn)) merge(draft, fn)
				}),
			)
		},
		[],
	)

	React.useEffect(() => {
		log(
			`${co.cyan(`Current settings`)}: ` +
				`${JSON.stringify(settings.all, null, 2)}`,
		)
	}, [])

	React.useEffect(() => {
		if (!settings.has('timestamp')) {
			setState({ prompt: { key: 'init' } })
		} else if (!settings.get(c.GENERATE_DIR_KEY)) {
			setState({ prompt: { key: 'ask-generate-path' } })
		} else {
			setState({
				prompt: { key: '' },
			})
			onReady?.()
		}
	}, [])

	return (
		<Panel>
			{state.prompt?.key ? (
				state.prompt.key === 'init' ? (
					<>
						<HighlightedText>Welcome!</HighlightedText>
						<Text>It seems like this is your first time using this app.</Text>
						<Text>
							The default directory for generating output will be set to{' '}
							<Text color="yellow">
								{com.getAbsFilePath(c.DEFAULT_GENERATE_PATH)}
							</Text>
						</Text>
						<Text>Would you like to continue with this setting?</Text>
						<Newline />
						<Select
							onSelect={(item) => {
								settings.set('timestamp', new Date().toISOString())
								if (item.value) {
									const pathToGenerateDir = com.getAbsFilePath(
										c.DEFAULT_GENERATE_PATH,
									)
									settings.set(c.GENERATE_DIR_KEY, pathToGenerateDir)
									if (!fs.existsSync(pathToGenerateDir)) {
										fs.ensureDirSync(pathToGenerateDir)
										log(
											`Created a new folder at ${co.yellow(pathToGenerateDir)}`,
										)
									}
									onReady?.()
								} else {
									setState({ prompt: { key: 'ask-generate-path' } })
								}
							}}
							items={[
								{ value: true, label: 'Yes' },
								{ value: false, label: `No. Set a different location` },
							]}
						/>
						<Newline />
					</>
				) : state.prompt.key === 'ask-generate-path' ? (
					<UncontrolledTextInput
						placeholder={`Enter the path relative to the location (${co.white(
							`example: "../../dist/src"`,
						)})`}
						onSubmit={(value) => {
							if (value) {
								const pathToGenerateDir = com.getAbsFilePath(value)
								if (!fs.existsSync(pathToGenerateDir)) {
									setState({
										prompt: {
											key: 'ask-instantiating-generate-path',
											dir: pathToGenerateDir,
										},
									})
								} else {
									setState({
										prompt: { key: '' },
									})
									onReady?.()
								}
							}
						}}
					/>
				) : state.prompt.key === 'ask-instantiating-generate-path' ? (
					<Box flexDirection="column">
						<Text color="white">
							The path {co.yellow(state.prompt.dir)} does not exist. Would you
							like for it to be created?
						</Text>
						<Newline />
						<Select
							items={[
								{ value: true, label: 'Yes' },
								{ value: false, label: `No` },
							]}
							onSelect={({ value }) => {
								if (value) {
									const pathToGenerateDir = state.prompt.dir as string
									settings.set(c.GENERATE_DIR_KEY, pathToGenerateDir)
									fs.ensureDirSync(pathToGenerateDir)
									log(`Created a new folder at ${co.yellow(pathToGenerateDir)}`)
									setState({
										prompt: { key: '' },
									})
									onReady?.()
								} else {
									setState({ prompt: { key: 'ask-generate-path' } })
								}
							}}
						/>
					</Box>
				) : null
			) : null}
		</Panel>
	)
}

export default Settings
